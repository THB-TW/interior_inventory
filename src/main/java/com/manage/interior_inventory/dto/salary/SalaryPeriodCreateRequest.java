package com.manage.interior_inventory.dto.salary;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record SalaryPeriodCreateRequest(
        @NotNull LocalDate periodStart,
        @NotNull LocalDate periodEnd,
        @NotBlank String label) {
}