package com.manage.interior_inventory.dto.finance.invoice;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record UpdateInvoiceAmountRequest(
        @NotNull BigDecimal receivableAmount,
        @NotNull BigDecimal cashDiscount,
        @NotNull BigDecimal netPayable) {
}