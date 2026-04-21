package com.manage.interior_inventory.dto.inventory;

import com.manage.interior_inventory.entity.WarehouseStatus;
import com.manage.interior_inventory.entity.WarehouseInventory;
import java.time.LocalDateTime;

public record WarehouseInventoryResponse(
        Long id,
        Long materialId,
        String materialName,
        String materialUnit,
        Integer quantity,
        String location,
        WarehouseStatus status,
        String remarks,
        LocalDateTime updatedAt) {
    public static WarehouseInventoryResponse fromEntity(WarehouseInventory inventory) {
        return new WarehouseInventoryResponse(
                inventory.getId(),
                inventory.getMaterial().getId(),
                inventory.getMaterial().getName(),
                inventory.getMaterial().getUnit(),
                inventory.getQuantity(),
                inventory.getLocation(),
                inventory.getStatus(),
                inventory.getRemarks(),
                inventory.getUpdatedAt());
    }
}
