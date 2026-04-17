package com.manage.interior_inventory.dto.project;

import com.manage.interior_inventory.entity.EstimationItem;

public record EstimationItemResponse(
        Long id,
        String materialName,
        Integer quantity,
        Integer unitPrice,
        Integer subtotal
) {
    public static EstimationItemResponse fromEntity(EstimationItem item) {
        return new EstimationItemResponse(
                item.getId(),
                item.getMaterialName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal()
        );
    }
}
