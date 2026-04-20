package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.inventory.InventorySuggestionResponse;
import com.manage.interior_inventory.dto.inventory.WarehouseInventoryRequest;
import com.manage.interior_inventory.dto.inventory.WarehouseInventoryResponse;
import com.manage.interior_inventory.service.WarehouseInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class WarehouseInventoryController {

    private final WarehouseInventoryService inventoryService;

    @GetMapping
    public ApiResponse<List<WarehouseInventoryResponse>> getAllInventory() {
        List<WarehouseInventoryResponse> inventory = inventoryService.getAllInventory();
        return ApiResponse.success("成功取得庫存", inventory);
    }

    @PostMapping
    public ApiResponse<WarehouseInventoryResponse> createInventory(@Valid @RequestBody WarehouseInventoryRequest request) {
        WarehouseInventoryResponse response = inventoryService.createInventory(request);
        return ApiResponse.success("成功新增庫存", response);
    }

    @PutMapping("/{id}")
    public ApiResponse<WarehouseInventoryResponse> updateInventory(
            @PathVariable Long id,
            @Valid @RequestBody WarehouseInventoryRequest request) {
        WarehouseInventoryResponse response = inventoryService.updateInventory(id, request);
        return ApiResponse.success("成功更新庫存", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ApiResponse.success("成功刪除庫存", null);
    }

    @GetMapping("/suggestions")
    public ApiResponse<List<InventorySuggestionResponse>> getSuggestions() {
        List<InventorySuggestionResponse> suggestions = inventoryService.getSuggestions();
        return ApiResponse.success("成功取得媒合建議", suggestions);
    }

    @PostMapping("/{id}/allocate/{projectId}")
    public ApiResponse<Void> allocateToProject(
            @PathVariable Long id,
            @PathVariable Long projectId) {
        inventoryService.allocateToProject(id, projectId);
        return ApiResponse.success("成功徵用剩料", null);
    }
}
