package com.manage.interior_inventory.dto.warehouse;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WarehouseReserveRequest {
    @NotNull(message = "Case ID is required")
    private Long caseId;

    private String note;
}
