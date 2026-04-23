package com.manage.interior_inventory.dto.project;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ContractUpdateRequest(

        @NotNull(message = "合約金額不能為空") @Min(value = 0, message = "合約金額不能為負數") BigDecimal contractAmount,

        @Min(value = 0, message = "收款金額不能為負數") BigDecimal receivedAmount,

        @NotNull(message = "收款狀態不能為空") String paymentStatus // "PENDING" / "PARTIAL" / "COMPLETED"
) {
}