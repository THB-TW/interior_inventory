package com.manage.interior_inventory.dto.project;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public record EstimationWorkerItemSaveRequest(
        @NotNull(message = "Worker ID is required")
        Long workerId,

        @NotNull(message = "Days is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Days must be greater than 0")
        BigDecimal days
) {
}
