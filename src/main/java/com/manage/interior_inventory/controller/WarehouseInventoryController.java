package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.warehouse.*;
import com.manage.interior_inventory.entity.WarehouseStatus;
import com.manage.interior_inventory.service.WarehouseInventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse")
@RequiredArgsConstructor
@Tag(name = "倉庫管理", description = "提供倉庫剩料的新增、查詢、修改與比對功能")
public class WarehouseInventoryController {

    private final WarehouseInventoryService warehouseInventoryService;

    @GetMapping
    @Operation(summary = "查詢所有剩料", description = "支援分頁與模糊搜尋 materialName 及篩選 status")
    public ApiResponse<Page<WarehouseInventoryResponse>> getInventories(
            @Parameter(description = "關鍵字 (模糊搜尋料件名稱)") @RequestParam(required = false) String keyword,
            @Parameter(description = "庫存狀態") @RequestParam(required = false) WarehouseStatus status,
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<WarehouseInventoryResponse> pageResult = warehouseInventoryService.getInventories(keyword, status, pageable);
        return ApiResponse.success("查詢成功", pageResult);
    }

    @GetMapping("/{id}")
    @Operation(summary = "查詢單筆剩料", description = "透過倉庫 ID 取得詳細資訊")
    public ApiResponse<WarehouseInventoryResponse> getInventoryById(
            @Parameter(description = "倉庫 ID", required = true) @PathVariable Long id) {
        return ApiResponse.success("查詢成功", warehouseInventoryService.getInventoryById(id));
    }

    @PostMapping
    @Operation(summary = "新增剩料", description = "新增一筆倉庫料件紀錄")
    public ApiResponse<WarehouseInventoryResponse> createInventory(
            @RequestBody @Valid WarehouseInventoryRequest request) {
        return ApiResponse.success("新增成功", warehouseInventoryService.createInventory(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新剩料", description = "更新倉庫料件資訊 (含 note、status、quantity 等)")
    public ApiResponse<WarehouseInventoryResponse> updateInventory(
            @Parameter(description = "倉庫 ID", required = true) @PathVariable Long id,
            @RequestBody @Valid WarehouseInventoryRequest request) {
        return ApiResponse.success("更新成功", warehouseInventoryService.updateInventory(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "刪除剩料", description = "實體刪除一筆倉庫資料")
    public ApiResponse<Void> deleteInventory(
            @Parameter(description = "倉庫 ID", required = true) @PathVariable Long id) {
        warehouseInventoryService.deleteInventory(id);
        return ApiResponse.success("刪除成功");
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "單獨更新狀態", description = "例如將狀態改為 RESERVED 或 USED")
    public ApiResponse<WarehouseInventoryResponse> updateInventoryStatus(
            @Parameter(description = "倉庫 ID", required = true) @PathVariable Long id,
            @RequestBody @Valid WarehouseStatusUpdateRequest request) {
        return ApiResponse.success("狀態更新成功", warehouseInventoryService.updateInventoryStatus(id, request));
    }

    @GetMapping("/match-cases")
    @Operation(summary = "剩料比對 API", description = "自動將可用倉庫剩料與案件用料比對，列出可支援的案件")
    public ApiResponse<List<WarehouseMatchResponse>> matchCases() {
        return ApiResponse.success("比對成功", warehouseInventoryService.matchAvailableInventoriesToCases());
    }

    @PatchMapping("/{id}/reserve")
    @Operation(summary = "標記剩料為使用中", description = "將剩料標記給某案件，並變更狀態為 RESERVED")
    public ApiResponse<Void> reserveInventory(
            @Parameter(description = "倉庫 ID", required = true) @PathVariable Long id,
            @RequestBody @Valid WarehouseReserveRequest request) {
        warehouseInventoryService.reserveInventory(id, request);
        return ApiResponse.success("標記成功");
    }
}
