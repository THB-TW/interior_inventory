package com.manage.interior_inventory.dto.finance;

import java.math.BigDecimal;

public record ProjectProfitDTO(
        Long projectId,
        String projectCode,
        String clientName,
        String status,

        BigDecimal contractAmount,
        BigDecimal receivedAmount,
        String paymentStatus,

        BigDecimal materialCost,
        BigDecimal workerCost,
        BigDecimal travelCost,

        BigDecimal profit,
        Double profitRate) {
}