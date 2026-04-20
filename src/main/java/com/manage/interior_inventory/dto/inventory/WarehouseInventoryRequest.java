package com.manage.interior_inventory.dto.inventory;

import com.manage.interior_inventory.entity.InventoryStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WarehouseInventoryRequest {

    private Long materialId;

    @NotBlank(message = "材料名稱不能為空")
    private String materialName;

    @NotNull(message = "數量不能為空")
    @Min(value = 0, message = "庫存數量不能小於0")
    private Integer quantity;

    private String location;

    @NotNull(message = "狀態不能為空")
    private InventoryStatus status;

    private String remarks;
}
