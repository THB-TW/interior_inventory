package com.manage.interior_inventory.dto.warehouse;

import com.manage.interior_inventory.entity.WarehouseInventory;
import com.manage.interior_inventory.entity.WarehouseStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class WarehouseInventoryResponse {
    private Long id;
    private Long materialId;
    private String materialName;
    private String unit;
    private BigDecimal quantity;
    private String location;
    private WarehouseStatus status;
    private String note;
    private LocalDateTime updatedAt;

    public static WarehouseInventoryResponse fromEntity(WarehouseInventory entity) {
        if (entity == null) {
            return null;
        }
        return WarehouseInventoryResponse.builder()
                .id(entity.getId())
                .materialId(entity.getMaterial() != null ? entity.getMaterial().getId() : null)
                .materialName(entity.getMaterial() != null ? entity.getMaterial().getName() : null)
                .unit(entity.getMaterial() != null ? entity.getMaterial().getUnit() : null)
                .quantity(entity.getQuantity())
                .location(entity.getLocation())
                .status(entity.getStatus())
                .note(entity.getNote())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
