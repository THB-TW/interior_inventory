package com.manage.interior_inventory.dto.bonus;

import java.math.BigDecimal;

public record BonusPreviewResponse(
        Long workerId,
        String workerName,
        BigDecimal totalDays,
        BigDecimal calculatedAmount // 系統試算獎金 (totalDays * dailyRate)
) {
}