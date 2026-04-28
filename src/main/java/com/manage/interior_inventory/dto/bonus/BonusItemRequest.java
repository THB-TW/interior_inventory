package com.manage.interior_inventory.dto.bonus;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BonusItemRequest(
        @NotNull(message = "師傅 ID 不能為空") Long workerId,

        @NotNull(message = "總天數不能為空") @DecimalMin(value = "0.0", message = "總天數不能為負數") BigDecimal totalDays,

        @NotNull(message = "試算金額不能為空") @DecimalMin(value = "0.0", message = "試算金額不能為負數") BigDecimal calculatedAmount,

        @NotNull(message = "實際發放金額不能為空") @DecimalMin(value = "0.0", message = "實際發放金額不能為負數") BigDecimal actualAmount // 老闆最終決定核發的金額
) {
}
