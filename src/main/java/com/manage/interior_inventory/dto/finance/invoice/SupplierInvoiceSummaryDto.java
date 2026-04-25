package com.manage.interior_inventory.dto.finance.invoice;

import com.manage.interior_inventory.entity.enums.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SupplierInvoiceSummaryDto(
    Long id,
    String supplierName,
    String invoiceNumber,
    LocalDate invoiceDate,
    BigDecimal totalAmount,
    InvoiceStatus status,
    LocalDateTime uploadedAt,
    int okCount,
    int mismatchCount,
    int notFoundCount
) {
}
