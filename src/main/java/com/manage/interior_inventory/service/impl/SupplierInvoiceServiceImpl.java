package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.dto.finance.invoice.SupplierInvoiceUploadResponse;
import com.manage.interior_inventory.dto.finance.invoice.SupplierInvoiceUploadResponse.*;
import com.manage.interior_inventory.entity.*;
import com.manage.interior_inventory.entity.enums.InvoiceItemMatchStatus;
import com.manage.interior_inventory.repository.*;
import com.manage.interior_inventory.service.SupplierInvoiceService;
import com.manage.interior_inventory.util.PdfBoxOcrParser;
import com.manage.interior_inventory.util.PdfBoxOcrParser.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierInvoiceServiceImpl implements SupplierInvoiceService {

    private final SupplierInvoiceRepository invoiceRepository;
    private final ProjectRepository projectRepository;
    private final CaseMaterialRepository caseMaterialRepository;
    private final MaterialRepository materialRepository;

    @Value("${app.upload.invoice-dir:uploads/invoices}")
    private String uploadDir;

    // ────────────────────────────────────────────────────────────────
    // 上傳 & 解析 & 比對
    // ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public SupplierInvoiceUploadResponse uploadAndParse(
            Long projectId, MultipartFile file) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Project not found: " + projectId));

        // 0. 若此案件已有對帳單，先刪舊的（一案只保一筆）
        List<SupplierInvoice> existing = invoiceRepository.findByProject_IdOrderByCreatedAtDesc(projectId);
        if (!existing.isEmpty()) {
            invoiceRepository.deleteAll(existing);
            invoiceRepository.flush();
        }

        // 1. 存 PDF 實體檔案
        String pdfPath = saveFile(projectId, file);

        // 2. 解析 PDF
        ParseResult pr;
        try {
            List<String> knownUnits = materialRepository.findAllDistinctUnits();
            log.debug("[SupplierInvoice] 動態單位清單 ({} 種): {}", knownUnits.size(), knownUnits);
            pr = PdfBoxOcrParser.parse(file.getBytes(), knownUnits);
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "無法讀取 PDF 檔案", e);
        }

        // 3. 建立 Invoice Header
        SupplierInvoice invoice = SupplierInvoice.builder()
                .project(project)
                .pdfPath(pdfPath)
                .deliveryAddress(pr.deliveryAddress())
                .receivableAmount(pr.receivableAmount())
                .cashDiscount(pr.cashDiscount())
                .netPayable(pr.netPayable())
                .build();

        // 4. 取得此案件所有材料，依類型分組
        List<CaseMaterial> allCaseMaterials = caseMaterialRepository.findByProject_Id(projectId);

        // 進貨批次（PURCHASE）：用於批次號比對
        List<CaseMaterial> purchaseMaterials = allCaseMaterials.stream()
                .filter(cm -> cm.getMaterialType() == CaseMaterialType.PURCHASE)
                .toList();

        // 5. 從 PDF 進貨行（非退貨）的出貨日期，建立「出貨日期 → PDF批次號」對照表
        // 最早日期 = 批次1，次早 = 批次2，依此類推
        List<LocalDate> sortedDates = pr.items().stream()
                .filter(i -> !i.isReturn() && i.deliveryDate() != null)
                .map(ParsedItem::deliveryDate)
                .distinct()
                .sorted()
                .toList();

        Map<LocalDate, Integer> dateToBatch = new LinkedHashMap<>();
        for (int i = 0; i < sortedDates.size(); i++)
            dateToBatch.put(sortedDates.get(i), i + 1);

        log.debug("[SupplierInvoice] PDF 批次對照表: {}", dateToBatch);

        // 6. 逐筆建立明細 + 比對
        Set<Long> matchedCaseMaterialIds = new HashSet<>();

        for (ParsedItem pi : pr.items()) {
            // 退貨行固定 batchNo = 0，進貨行依出貨日期對照
            int batchNo = pi.isReturn() ? 0
                    : dateToBatch.getOrDefault(pi.deliveryDate(), 1);

            InvoiceItemMatchStatus status;
            Long matchedMaterialId = null;

            if (pi.isReturn()) {
                // 退貨行：暫維持 RETURNED（問題二再處理完整退貨比對）
                status = InvoiceItemMatchStatus.RETURNED;

            } else {
                // ── 進貨行：先判批次是否存在，再判名稱 ──
                // 1. 這個 PDF 批次號，系統有沒有任何材料對應？
                boolean batchExists = purchaseMaterials.stream()
                        .anyMatch(cm -> cm.getOrderBatch() == batchNo);

                if (!batchExists) {
                    // 批次根本不存在（例如系統只叫了2批，PDF出現第5批）
                    // 不管名稱有沒有，都是批次未叫貨
                    log.warn("[SupplierInvoice] 批次不存在 - 材料: {}, PDF批次: {}, 系統最大批次: {}",
                            pi.materialNameRaw(), batchNo,
                            purchaseMaterials.stream()
                                    .mapToInt(CaseMaterial::getOrderBatch)
                                    .max().orElse(0));
                    status = InvoiceItemMatchStatus.BATCH_NOT_FOUND_IN_SYS;

                } else {
                    // 批次存在，再比對名稱
                    Optional<CaseMaterial> matchOpt = findMatchByBatch(purchaseMaterials, pi.materialNameRaw(),
                            batchNo);

                    if (matchOpt.isPresent()) {
                        // 名稱 & 批次都對上：比對數量、單價
                        CaseMaterial cm = matchOpt.get();
                        matchedMaterialId = cm.getMaterial().getId();
                        matchedCaseMaterialIds.add(cm.getId());

                        BigDecimal sysQty = BigDecimal.valueOf(cm.getQuantity());
                        BigDecimal sysPrice = cm.getUnitPrice();

                        if (pi.quantity().compareTo(sysQty) != 0) {
                            status = InvoiceItemMatchStatus.QTY_MISMATCH;
                        } else if (sysPrice != null
                                && pi.unitPrice() != null
                                && sysPrice.compareTo(pi.unitPrice()) != 0) {
                            status = InvoiceItemMatchStatus.PRICE_MISMATCH;
                        } else {
                            status = InvoiceItemMatchStatus.OK;
                        }

                    } else {
                        // 批次存在，但這個批次裡找不到這個材料名稱
                        status = InvoiceItemMatchStatus.NOT_FOUND_IN_SYS;
                    }
                }
            }

            invoice.addItem(SupplierInvoiceItem.builder()
                    .batchNo(batchNo)
                    .deliveryDate(pi.deliveryDate())
                    .materialId(matchedMaterialId)
                    .materialNameRaw(pi.materialNameRaw())
                    .unit(pi.unit())
                    .quantity(pi.quantity())
                    .unitPrice(pi.unitPrice())
                    .totalPrice(pi.totalPrice())
                    .matchStatus(status)
                    .build());
        }

        // 7. 補 NOT_FOUND_IN_PDF：系統進貨記錄有但 PDF 完全沒出現的材料批次
        for (CaseMaterial cm : purchaseMaterials) {
            if (matchedCaseMaterialIds.contains(cm.getId()))
                continue;

            invoice.addItem(SupplierInvoiceItem.builder()
                    .batchNo(-1) // -1 代表虛擬補充行
                    .deliveryDate(null)
                    .materialId(cm.getMaterial().getId())
                    .materialNameRaw(cm.getMaterial().getName())
                    .unit(cm.getMaterial().getUnit() != null
                            ? cm.getMaterial().getUnit()
                            : "")
                    .quantity(BigDecimal.ZERO)
                    .unitPrice(null)
                    .totalPrice(null)
                    .matchStatus(InvoiceItemMatchStatus.NOT_FOUND_IN_PDF)
                    .build());
        }

        // 8. 儲存
        invoiceRepository.save(invoice);

        return buildResponse(invoice);
    }

    // ────────────────────────────────────────────────────────────────
    // 查詢單一對帳單
    // ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public SupplierInvoiceUploadResponse getDetail(Long invoiceId) {
        SupplierInvoice invoice = invoiceRepository.findByIdWithItems(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Invoice not found: " + invoiceId));
        return buildResponse(invoice);
    }

    // ────────────────────────────────────────────────────────────────
    // 查詢案件所有對帳單列表
    // ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<SupplierInvoiceUploadResponse> listByProject(Long projectId) {
        return invoiceRepository
                .findByProject_IdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    // ────────────────────────────────────────────────────────────────
    // 私有工具方法
    // ────────────────────────────────────────────────────────────────

    /** 組裝 Response，明細依 batch_no 分組排序 */
    private SupplierInvoiceUploadResponse buildResponse(SupplierInvoice invoice) {

        int ok = 0, notSys = 0, notPdf = 0, qtyMis = 0, priceMis = 0, batchNotFound = 0, returned = 0;

        // 依 batch_no 分組
        Map<Integer, List<SupplierInvoiceItem>> byBatch = invoice.getItems()
                .stream()
                .collect(Collectors.groupingBy(SupplierInvoiceItem::getBatchNo));

        // batch_no 排序：1, 2, 3... → 0(退貨) → -1(NOT_FOUND_IN_PDF) 排最後
        List<BatchGroup> batches = byBatch.entrySet().stream()
                .sorted(Comparator.comparingInt(e -> {
                    int k = e.getKey();
                    if (k == -1)
                        return Integer.MAX_VALUE;
                    if (k == 0)
                        return Integer.MAX_VALUE - 1;
                    return k;
                }))
                .map(e -> {
                    List<ItemDto> dtos = e.getValue().stream()
                            .map(it -> new ItemDto(
                                    it.getId(),
                                    it.getMaterialNameRaw(),
                                    it.getUnit(),
                                    it.getQuantity(),
                                    it.getUnitPrice(),
                                    it.getTotalPrice(),
                                    it.getMaterialId(),
                                    it.getMatchStatus()))
                            .toList();

                    LocalDate date = e.getValue().stream()
                            .map(SupplierInvoiceItem::getDeliveryDate)
                            .filter(Objects::nonNull)
                            .findFirst()
                            .orElse(null);

                    return new BatchGroup(e.getKey(), date, dtos);
                })
                .toList();

        // 統計（BATCH_NOT_FOUND_IN_SYS 歸入 notSys 類）
        for (SupplierInvoiceItem it : invoice.getItems()) {
            switch (it.getMatchStatus()) {
                case OK -> ok++;
                case NOT_FOUND_IN_SYS -> notSys++;
                case BATCH_NOT_FOUND_IN_SYS -> batchNotFound++;
                case NOT_FOUND_IN_PDF -> notPdf++;
                case QTY_MISMATCH -> qtyMis++;
                case PRICE_MISMATCH -> priceMis++;
                case RETURNED -> returned++;
            }
        }

        return new SupplierInvoiceUploadResponse(
                invoice.getId(),
                invoice.getDeliveryAddress(),
                invoice.getReceivableAmount(),
                invoice.getCashDiscount(),
                invoice.getNetPayable(),
                batches,
                ok, notSys, notPdf, qtyMis, priceMis, batchNotFound, returned);
    }

    /**
     * 依「材料名稱 + 叫貨批次號」比對進貨記錄（排除退貨行）
     * pdfBatchNo：從 PDF 出貨日期排序得出（最早=1, 次早=2...）
     * CaseMaterial.orderBatch：老闆在系統填寫的叫貨批次
     */
    private Optional<CaseMaterial> findMatchByBatch(
            List<CaseMaterial> purchaseMaterials,
            String pdfName,
            int pdfBatchNo) {
        String norm = normalize(pdfName);
        return purchaseMaterials.stream()
                .filter(cm -> normalize(cm.getMaterial().getName()).equals(norm))
                .filter(cm -> cm.getOrderBatch() == pdfBatchNo)
                .findFirst();
    }

    /** 儲存上傳的 PDF 檔案，回傳絕對路徑字串 */
    private String saveFile(Long projectId, MultipartFile file) {
        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            String filename = projectId + "_" + UUID.randomUUID() + ".pdf";
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target,
                    StandardCopyOption.REPLACE_EXISTING);
            return target.toString();
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "檔案儲存失敗", e);
        }
    }

    /** 標準化材料名稱：去空白、統一符號、轉小寫 */
    private static String normalize(String name) {
        if (name == null)
            return "";
        return name.trim()
                .replaceAll("[　\\s]+", "")
                .replace("*", "×")
                .toLowerCase();
    }
}