package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.inventory.WarehouseInventoryResponse;
import com.manage.interior_inventory.service.WarehouseInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
