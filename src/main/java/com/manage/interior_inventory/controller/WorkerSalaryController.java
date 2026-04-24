package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.salary.*;
import com.manage.interior_inventory.service.WorkerSalaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance/salary")
@RequiredArgsConstructor
@Tag(name = "財務 - 師傅薪資", description = "薪資期別管理、明細查詢、付款標記")
public class WorkerSalaryController {

    private final WorkerSalaryService salaryService;

    // ────────────────────────────────────────
    // Period
    // ────────────────────────────────────────

    @GetMapping("/periods")
    @Operation(summary = "查詢所有薪資期別", description = "依開始日期倒序，不含師傅明細")
    public ApiResponse<List<SalaryPeriodResponse>> getAllPeriods() {
        return ApiResponse.success("查詢成功", salaryService.getAllPeriods());
    }

    @GetMapping("/periods/{periodId}")
    @Operation(summary = "查詢單一期別", description = "含各師傅彙總金額")
    public ApiResponse<SalaryPeriodResponse> getPeriodById(
            @PathVariable Long periodId) {
        return ApiResponse.success("查詢成功", salaryService.getPeriodById(periodId));
    }

    @PostMapping("/periods")
    @Operation(summary = "建立薪資期別", description = "狀態預設 PENDING")
    public ApiResponse<SalaryPeriodResponse> createPeriod(
            @Valid @RequestBody SalaryPeriodCreateRequest req) {
        return ApiResponse.success("建立成功", salaryService.createPeriod(req));
    }

    @PatchMapping("/periods/{periodId}/confirm")
    @Operation(summary = "確認期別", description = "PENDING → CONFIRMED，鎖定數字")
    public ApiResponse<SalaryPeriodResponse> confirmPeriod(
            @PathVariable Long periodId) {
        return ApiResponse.success("確認成功", salaryService.confirmPeriod(periodId));
    }

    @PatchMapping("/periods/{periodId}/pay")
    @Operation(summary = "期別全部付款", description = "CONFIRMED → PAID，批次標記所有未付項目")
    public ApiResponse<SalaryPeriodResponse> markPeriodPaid(
            @PathVariable Long periodId) {
        return ApiResponse.success("付款成功", salaryService.markPeriodPaid(periodId));
    }

    // ────────────────────────────────────────
    // Items
    // ────────────────────────────────────────

    @GetMapping("/periods/{periodId}/items")
    @Operation(summary = "查詢期別明細", description = "該期所有師傅薪資明細（含分潤制）")
    public ApiResponse<List<SalaryItemDetail>> getItemsByPeriod(
            @PathVariable Long periodId) {
        return ApiResponse.success("查詢成功", salaryService.getItemsByPeriod(periodId));
    }

    @GetMapping("/workers/{workerId}/items")
    @Operation(summary = "查詢師傅薪資歷史", description = "某師傅所有期別的領薪紀錄")
    public ApiResponse<List<SalaryItemDetail>> getItemsByWorker(
            @PathVariable Long workerId) {
        return ApiResponse.success("查詢成功", salaryService.getItemsByWorker(workerId));
    }

    @PatchMapping("/items/{itemId}/adjust")
    @Operation(summary = "調整薪資明細", description = "手動加減金額，已付款或已結算不可調整")
    public ApiResponse<SalaryItemDetail> adjustItem(
            @PathVariable Long itemId,
            @Valid @RequestBody SalaryItemAdjustRequest req) {
        return ApiResponse.success("調整成功", salaryService.adjustItem(itemId, req));
    }

    @PatchMapping("/items/{itemId}/pay")
    @Operation(summary = "單筆標記付款", description = "個別項目標記已付，記錄付款時間")
    public ApiResponse<SalaryItemDetail> markItemPaid(
            @PathVariable Long itemId) {
        return ApiResponse.success("付款成功", salaryService.markItemPaid(itemId));
    }
}