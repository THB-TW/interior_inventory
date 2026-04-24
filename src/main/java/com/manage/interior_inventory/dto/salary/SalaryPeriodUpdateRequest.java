package com.manage.interior_inventory.dto.salary;

import java.time.LocalDate;

public record SalaryPeriodUpdateRequest(
        LocalDate periodStart,
        LocalDate periodEnd,
        String label,
        String status) {
}
