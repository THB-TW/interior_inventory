package com.manage.interior_inventory.dto.finance.invoice;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InvoiceCompareResultDto(
    Long tempInvoiceId,
    String supplierName,
    String invoiceNumber,
    LocalDate invoiceDate,
    BigDecimal totalAmount,
    List<InvoiceItemCompareDto> items,
    int okCount,
    int mismatchCount,
    int notFoundCount
) {
}
