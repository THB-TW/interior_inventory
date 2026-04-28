package com.manage.interior_inventory.dto.worker;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.manage.interior_inventory.entity.CaseWorker;

public record CaseWorkerResponse(
        Long id,
        Long workerId, // nullable，方便前端判斷是否綁定名單
        String workerName, // 從 worker.nickname 帶出，worker 被刪時為 null
        BigDecimal dailyWage,
        LocalDate workday,
        BigDecimal daysWorked,
        BigDecimal travelExpenses,
        BigDecimal mealAllowance) {
    public static CaseWorkerResponse fromEntity(CaseWorker cw) {
        return new CaseWorkerResponse(
                cw.getId(),
                cw.getWorker() != null ? cw.getWorker().getId() : null,
                cw.getWorker() != null ? cw.getWorker().getNickname() : null,
                cw.getDailyWage(),
                cw.getWorkday(),
                cw.getDaysWorked(),
                cw.getTravelExpenses(),
                cw.getMealAllowance());
    }
}