package com.manage.interior_inventory.dto.material;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialSaveRequest {
    private String name;
    private String unit;
    private String description;
    private BigDecimal defaultPrice;
    private Boolean isActive;
}