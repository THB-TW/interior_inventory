package com.manage.interior_inventory.dto.inventory;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventorySuggestionResponse {
    private Long inventoryId;
    private Long materialId;
    private String materialName;
    private String materialUnit;
    private Integer remainQuantity;
    private String location;

    // Project Needs
    private Long projectId;
    private String projectName;
    private String projectAddress;
    private Integer projectQuantity;
}
