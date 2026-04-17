package com.manage.interior_inventory.dto.project;

import com.manage.interior_inventory.entity.EstimationWorkerItem;
import java.math.BigDecimal;

public record EstimationWorkerItemResponse(
        Long id,
        Long workerId,
        BigDecimal days,
        Integer subtotal
) {
    public static EstimationWorkerItemResponse fromEntity(EstimationWorkerItem item) {
        return new EstimationWorkerItemResponse(
                item.getId(),
                item.getWorkerId(),
                item.getDays(),
                item.getSubtotal()
        );
    }
}
