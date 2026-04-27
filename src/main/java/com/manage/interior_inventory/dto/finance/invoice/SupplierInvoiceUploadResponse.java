package com.manage.interior_inventory.dto.finance.invoice;

import com.manage.interior_inventory.entity.enums.InvoiceItemMatchStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SupplierInvoiceUploadResponse(
        Long invoiceId,
        String deliveryAddress, // 前端顯示讓老闆核對案件地址
        BigDecimal receivableAmount,
        BigDecimal cashDiscount,
        BigDecimal netPayable,

        // 按批次分組的明細
        List<BatchGroup> batches,

        // 比對統計
        int okCount,
        int notFoundInSysCount,
        int notFoundInPdfCount,
        int qtyMismatchCount,
        int priceMismatchCount,
        int batchNotFoundCount,
        int returnedCount) {
    public record BatchGroup(
            int batchNo, // 0 = 退貨
            LocalDate deliveryDate,
            List<ItemDto> items) {
    }

    public record ItemDto(
            Long itemId,
            String materialNameRaw,
            String unit,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal totalPrice,
            Long materialId, // null = 比對不到
            InvoiceItemMatchStatus matchStatus) {
    }
}