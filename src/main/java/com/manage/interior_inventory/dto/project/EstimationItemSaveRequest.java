package com.manage.interior_inventory.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public record EstimationItemSaveRequest(
        @NotBlank(message = "Material name is required")
        String materialName,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        @NotNull(message = "Unit price is required")
        @Min(value = 0, message = "Unit price must be positive")
        Integer unitPrice
) {
}
