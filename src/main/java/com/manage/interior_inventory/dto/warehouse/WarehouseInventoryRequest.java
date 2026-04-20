package com.manage.interior_inventory.dto.warehouse;

import com.manage.interior_inventory.entity.WarehouseStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WarehouseInventoryRequest {
    @NotNull(message = "Material ID is required")
    private Long materialId;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private BigDecimal quantity;

    private String location;

    private WarehouseStatus status = WarehouseStatus.AVAILABLE;

    private String note;
}
