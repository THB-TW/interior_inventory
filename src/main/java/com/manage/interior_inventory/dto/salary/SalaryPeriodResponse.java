package com.manage.interior_inventory.dto.salary;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record SalaryPeriodResponse(
        Long id,
        LocalDate periodStart,
        LocalDate periodEnd,
        String label,
        String status,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal unpaidAmount,
        LocalDateTime createdAt,
        List<WorkerSalarySummary> workers // nullable，列表頁不帶明細
) {
}