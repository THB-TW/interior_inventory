package com.manage.interior_inventory.dto.salary;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SalaryItemAdjustRequest(
        @NotNull BigDecimal adjustment,
        String note) {
}