package com.manage.interior_inventory.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.*;

@Slf4j
public class PdfBoxOcrParser {

    // ── 解析結果 Record ───────────────────────────────────────────────

    public record ParsedItem(
            String materialNameRaw,
            String unit,
            BigDecimal quantity, // 退貨為負
            BigDecimal unitPrice,
            BigDecimal totalPrice,
            LocalDate deliveryDate,
            boolean isReturn) {
    }

    public record ParseResult(
            String deliveryAddress,
            BigDecimal receivableAmount,
            BigDecimal cashDiscount,
            BigDecimal netPayable,
            List<ParsedItem> items // 含退貨行
    ) {
    }

    // ── Regex ─────────────────────────────────────────────────────────

    // 送貨地點
    private static final Pattern P_DELIVERY = Pattern.compile("送貨地點[：:]*\\s*(.+)");

    // 應收總額：e.g. "應收總額: 48,430"
    private static final Pattern P_RECEIVABLE = Pattern.compile("應收總額[：:]*\\s*([\\d,]+)");

    // 現金扣款：e.g. "現金扣款4%:1,937"
    private static final Pattern P_DISCOUNT = Pattern.compile("現金扣款[^:：]*[：:]\\s*([\\d,]+)");

    // 付現應收：e.g. "付現應收: 46,493"
    private static final Pattern P_NET = Pattern.compile("付現應收[：:]*\\s*([\\d,]+)");

    // 批次 header：民國日期 + 出貨單號，同一行或相鄰
    // e.g. "115/02/09 115020185"
    private static final Pattern P_BATCH_HEADER = Pattern.compile("^(\\d{3}/\\d{2}/\\d{2})\\s+(\\d{5,})");

    // 退貨區段標記
    private static final Pattern P_RETURN_SECTION = Pattern.compile(".*以下退回收退料.*");

    // 跳過行（小計數字、分隔線、礦泉水★、帳款區間等）
    private static final Pattern P_SKIP = Pattern.compile(
            "^[\\d,]+$|^-{3,}|^~{2,}|.*★{3,}|^票期|^稅金|^出貨單|收款對帳單");

    // 當 DB 為空時的保底清單
    private static final List<String> FALLBACK_UNITS = List.of(
            "支", "片", "箱", "才", "組", "包", "桶", "條", "塊", "式",
            "坪", "張", "個", "捲", "套", "m²", "㎡", "m", "尺", "塊");

    public static Pattern buildItemPattern(Collection<String> units) {
        Set<String> merged = new LinkedHashSet<>(units);
        merged.addAll(FALLBACK_UNITS);

        String unitGroup = merged.stream()
                .filter(u -> u != null && !u.isBlank())
                .sorted(Comparator.comparingInt(String::length).reversed()) // 長的先，避免 m² 被 m 截斷
                .map(Pattern::quote) // 安全 escape 特殊字元
                .reduce((a, b) -> a + "|" + b)
                .orElse("支|片|箱|才|組|包|桶|條|塊|式|坪|張|個|捲|套");

        return Pattern.compile(
                "^(退\\s+)?(.+?)\\s+" +
                        "(-?\\d+(?:\\.\\d+)?)" +
                        "(" + unitGroup + ")" +
                        "\\s+(-?[\\d,]+(?:\\.\\d+)?)\\s+(-?[\\d,]+)$");
    }

    // ── 工具：民國年 → LocalDate ──────────────────────────────────────

    private static LocalDate rocToDate(String roc) {
        // "115/02/09" → 2026-02-09
        String[] p = roc.split("/");
        return LocalDate.of(
                Integer.parseInt(p[0]) + 1911,
                Integer.parseInt(p[1]),
                Integer.parseInt(p[2]));
    }

    private static BigDecimal parseMoney(String s) {
        if (s == null || s.isBlank())
            return null;
        return new BigDecimal(s.replace(",", ""));
    }

    // ── 主入口 ────────────────────────────────────────────────────────

    public static ParseResult parse(byte[] pdfBytes, Collection<String> knownUnits) {
        try (PDDocument doc = Loader.loadPDF(pdfBytes)) {
            String text = new PDFTextStripper().getText(doc);
            if (text == null || text.isBlank())
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "無法解析此 PDF，請確認為文字型 PDF");
            return parseText(text, knownUnits);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("PDF parse failed", e);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "PDF 解析失敗：" + e.getMessage(), e);
        }
    }

    /** 純文字入口，方便單元測試 */
    public static ParseResult parseText(String text, Collection<String> knownUnits) {
        Pattern pItem = buildItemPattern(knownUnits == null ? List.of() : knownUnits);
        String[] lines = text.split("\\r?\\n");

        // ── Phase 1：Header（掃全文，找到即記錄）────────────────────
        String deliveryAddress = null;
        BigDecimal receivableAmount = null;
        BigDecimal cashDiscount = null;
        BigDecimal netPayable = null;

        for (String raw : lines) {
            String t = raw.trim();
            if (deliveryAddress == null) {
                Matcher m = P_DELIVERY.matcher(t);
                if (m.find())
                    deliveryAddress = m.group(1).trim();
            }
            if (receivableAmount == null) {
                Matcher m = P_RECEIVABLE.matcher(t);
                if (m.find())
                    receivableAmount = parseMoney(m.group(1));
            }
            if (cashDiscount == null) {
                Matcher m = P_DISCOUNT.matcher(t);
                if (m.find())
                    cashDiscount = parseMoney(m.group(1));
            }
            if (netPayable == null) {
                Matcher m = P_NET.matcher(t);
                if (m.find())
                    netPayable = parseMoney(m.group(1));
            }
        }

        // ── Phase 2：品項（依批次 header 分組）──────────────────────
        List<ParsedItem> items = new ArrayList<>();
        boolean returnMode = false;
        LocalDate currentDate = null;

        for (String raw : lines) {
            String t = raw.trim();
            if (t.isEmpty())
                continue;

            // 退貨區段標記
            if (P_RETURN_SECTION.matcher(t).find()) {
                returnMode = true;
                continue;
            }

            // 跳過行
            if (P_SKIP.matcher(t).find())
                continue;

            // 批次 header：更新當前日期
            Matcher bm = P_BATCH_HEADER.matcher(t);
            if (bm.find()) {
                currentDate = rocToDate(bm.group(1));
                continue;
            }

            // 品項行
            Matcher im = pItem.matcher(t); // P_ITEM → pItem
            if (!im.matches())
                continue;

            boolean hasReturnPrefix = im.group(1) != null;
            boolean isReturn = returnMode || hasReturnPrefix;
            String name = im.group(2).trim();
            BigDecimal qty = parseMoney(im.group(3));
            String unit = im.group(4);
            BigDecimal price = parseMoney(im.group(5));
            BigDecimal total = parseMoney(im.group(6));

            // 退貨確保數值為負
            if (isReturn) {
                if (qty != null && qty.signum() > 0)
                    qty = qty.negate();
                if (total != null && total.signum() > 0)
                    total = total.negate();
            }

            items.add(new ParsedItem(
                    name, unit, qty, price, total, currentDate, isReturn));
        }

        return new ParseResult(
                deliveryAddress, receivableAmount, cashDiscount, netPayable, items);
    }
}