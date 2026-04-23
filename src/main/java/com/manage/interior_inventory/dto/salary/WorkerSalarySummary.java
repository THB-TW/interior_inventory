package com.manage.interior_inventory.dto.salary;

import java.math.BigDecimal;
import java.util.List;

public record WorkerSalarySummary(
        Long workerId,
        String workerNickname,
        String wageType,
        BigDecimal subtotal,
        BigDecimal paidAmount,
        BigDecimal unpaidAmount,
        boolean allPaid,
        List<SalaryItemDetail> items // nullable，彙總頁不帶明細
) {
}