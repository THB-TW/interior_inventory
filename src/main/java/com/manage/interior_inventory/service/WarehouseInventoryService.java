package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.inventory.WarehouseInventoryResponse;
import com.manage.interior_inventory.dto.inventory.WarehouseInventoryRequest;
import com.manage.interior_inventory.dto.inventory.InventorySuggestionResponse;
import java.util.List;

public interface WarehouseInventoryService {
    List<WarehouseInventoryResponse> getAllInventory();
    WarehouseInventoryResponse createInventory(WarehouseInventoryRequest request);
    WarehouseInventoryResponse updateInventory(Long id, WarehouseInventoryRequest request);
    void deleteInventory(Long id);
    List<InventorySuggestionResponse> getSuggestions();
    void allocateToProject(Long inventoryId, Long projectId);
}
