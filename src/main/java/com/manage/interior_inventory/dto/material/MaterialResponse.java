package com.manage.interior_inventory.dto.material;

import com.manage.interior_inventory.entity.Material;

import java.math.BigDecimal;

public record MaterialResponse(
        Long id,
        String name,
        String unit,
        String description,
        BigDecimal defaultPrice,
        Boolean isActive) {
    public static MaterialResponse fromEntity(Material material) {
        return new MaterialResponse(
                material.getId(),
                material.getName(),
                material.getUnit(),
                material.getDescription(),
                material.getDefaultPrice(),
                material.getIsActive());
    }
}