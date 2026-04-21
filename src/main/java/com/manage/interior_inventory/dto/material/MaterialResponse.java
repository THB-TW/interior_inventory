package com.manage.interior_inventory.dto.material;

import com.manage.interior_inventory.entity.Material;

public record MaterialResponse(
        Long id,
        String name,
        String unit) {
    public static MaterialResponse fromEntity(Material material) {
        return new MaterialResponse(
                material.getId(),
                material.getName(),
                material.getUnit());
    }
}