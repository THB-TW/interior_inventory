package com.manage.interior_inventory.dto.salary;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SalaryItemDetail(
        Long id,
        Long periodId,
        Long workerId,
        String workerNickname,
        Long projectId,
        String projectCode, // 顯示用，e.g. IP-202601-001
        String wageType,
        BigDecimal baseAmount,
        BigDecimal travelExpenses,
        BigDecimal mealAllowance,
        BigDecimal adjustment,
        BigDecimal finalAmount,
        boolean isPaid,
        LocalDateTime paidAt,
        String note,
        LocalDateTime createdAt) {
}