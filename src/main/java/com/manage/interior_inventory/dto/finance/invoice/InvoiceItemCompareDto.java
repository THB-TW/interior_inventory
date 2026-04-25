package com.manage.interior_inventory.dto.finance.invoice;

import com.manage.interior_inventory.entity.enums.InvoiceItemMatchStatus;
import java.math.BigDecimal;

public record InvoiceItemCompareDto(
    String materialName,
    String specification,
    String unit,
    BigDecimal invoiceQty,
    BigDecimal invoiceUnitPrice,
    BigDecimal invoiceTotalPrice,
    BigDecimal systemQty,
    BigDecimal systemUnitPrice,
    InvoiceItemMatchStatus matchStatus,
    Long caseMaterialId,
    boolean isReturn
) {
}
