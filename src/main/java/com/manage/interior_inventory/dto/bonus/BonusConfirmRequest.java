package com.manage.interior_inventory.dto.bonus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BonusConfirmRequest(
        @NotNull(message = "起始日期不能為空") LocalDate startDate,

        @NotNull(message = "結束日期不能為空") LocalDate endDate,

        @NotBlank(message = "標籤不能為空") String label, // 例如: "2026 端午節獎金"

        @NotNull(message = "每日基準不能為空") BigDecimal dailyRate,

        @NotEmpty(message = "發放名單不能為空") @Valid // 確保裡面的 Item 也會被驗證
        List<BonusItemRequest> items) {
}
