package com.manage.interior_inventory.dto.project;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ProjectEstimationSaveRequest(
        @NotNull(message = "Profit is required")
        Integer profit,
        
        List<EstimationItemSaveRequest> items,
        List<EstimationWorkerItemSaveRequest> workerItems
) {
}
