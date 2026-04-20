package com.manage.interior_inventory.dto.warehouse;

import com.manage.interior_inventory.entity.WarehouseStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WarehouseStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private WarehouseStatus status;

    private String note;
}
