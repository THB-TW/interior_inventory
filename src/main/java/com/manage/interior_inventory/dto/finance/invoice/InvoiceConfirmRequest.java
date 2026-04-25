package com.manage.interior_inventory.dto.finance.invoice;

import jakarta.validation.constraints.NotNull;

public record InvoiceConfirmRequest(
    @NotNull(message = "暫存對帳單ID不能為空")
    Long tempInvoiceId,
    @NotNull(message = "專案ID不能為空")
    Long projectId
) {
}
