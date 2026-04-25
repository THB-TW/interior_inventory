package com.manage.interior_inventory.util;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
public class PdfBoxOcrParser {

    public record ParsedInvoiceItem(String deliveryDate, String invoiceNo, String materialName, String unit, BigDecimal quantity, BigDecimal unitPrice, BigDecimal totalPrice, boolean isReturn) {}
    public record ParseResult(String supplierName, String invoiceDateRange, List<ParsedInvoiceItem> items) {}

    public static ParseResult parse(MultipartFile file) {
        try (InputStream is = file.getInputStream(); PDDocument document = Loader.loadPDF(is.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            if (text == null || text.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "無法解析此 PDF，請確認為文字型 PDF");
            }

            List<ParsedInvoiceItem> items = new ArrayList<>();
            String[] lines = text.split("\\r?\\n");

            String invoiceDateRange = null;
            String supplierName = "建材商(未解析)";

            Pattern itemPattern = Pattern.compile("(.+?)\\s+(\\d+)([支片箱台組式坪])\\s+(\\d[\\d,]*)\\s+([\\d,]+)");

            for (String line : lines) {
                String tLine = line.trim();

                if (tLine.matches("^\\d+$") || tLine.contains("~") || tLine.contains("----") || tLine.contains("★★★★")) {
                    continue;
                }

                if (tLine.startsWith("客戶名稱") || tLine.contains("建材")) {
                     if (supplierName.equals("建材商(未解析)")) {
                         supplierName = tLine;
                     }
                }

                if (tLine.startsWith("帳款區間:")) {
                    invoiceDateRange = tLine.substring(tLine.indexOf(":") + 1).trim();
                }

                boolean isReturn = tLine.startsWith("退");
                String parseLine = isReturn ? tLine.substring(1).trim() : tLine;

                Matcher m = itemPattern.matcher(parseLine);
                if (m.find()) {
                    String materialName = m.group(1).trim();
                    String qtyStr = m.group(2).replace(",", "");
                    String unit = m.group(3);
                    String unitPriceStr = m.group(4).replace(",", "");
                    String totalPriceStr = m.group(5).replace(",", "");

                    BigDecimal qty = new BigDecimal(qtyStr);
                    BigDecimal unitPrice = new BigDecimal(unitPriceStr);
                    BigDecimal totalPrice = new BigDecimal(totalPriceStr);

                    if (isReturn) {
                        qty = qty.negate();
                        totalPrice = totalPrice.negate();
                    }

                    items.add(new ParsedInvoiceItem(invoiceDateRange, null, materialName, unit, qty, unitPrice, totalPrice, isReturn));
                }
            }

            return new ParseResult(supplierName, invoiceDateRange, items);

        } catch (Exception e) {
            log.error("Failed to parse PDF", e);
            if (e instanceof ResponseStatusException) {
                throw (ResponseStatusException) e;
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "無法解析此 PDF，請確認為文字型 PDF", e);
        }
    }
}
