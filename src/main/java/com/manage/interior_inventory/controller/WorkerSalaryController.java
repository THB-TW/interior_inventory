package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.dto.salary.*;
import com.manage.interior_inventory.service.WorkerSalaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<SalaryPeriodResponse>> getAllPeriods() {
        return ResponseEntity.ok(salaryService.getAllPeriods());
    }

    @GetMapping("/periods/{periodId}")
    @Operation(summary = "查詢單一期別", description = "含各師傅彙總金額")
    public ResponseEntity<SalaryPeriodResponse> getPeriodById(
            @PathVariable Long periodId) {
        return ResponseEntity.ok(salaryService.getPeriodById(periodId));
    }

    @PostMapping("/periods")
    @Operation(summary = "建立薪資期別", description = "狀態預設 PENDING")
    public ResponseEntity<SalaryPeriodResponse> createPeriod(
            @Valid @RequestBody SalaryPeriodCreateRequest req) {
        return ResponseEntity.ok(salaryService.createPeriod(req));
    }

    @PatchMapping("/periods/{periodId}/confirm")
    @Operation(summary = "確認期別", description = "PENDING → CONFIRMED，鎖定數字")
    public ResponseEntity<SalaryPeriodResponse> confirmPeriod(
            @PathVariable Long periodId) {
        return ResponseEntity.ok(salaryService.confirmPeriod(periodId));
    }

    @PatchMapping("/periods/{periodId}/pay")
    @Operation(summary = "期別全部付款", description = "CONFIRMED → PAID，批次標記所有未付項目")
    public ResponseEntity<SalaryPeriodResponse> markPeriodPaid(
            @PathVariable Long periodId) {
        return ResponseEntity.ok(salaryService.markPeriodPaid(periodId));
    }

    // ────────────────────────────────────────
    // Items
    // ────────────────────────────────────────

    @GetMapping("/periods/{periodId}/items")
    @Operation(summary = "查詢期別明細", description = "該期所有師傅薪資明細（含分潤制）")
    public ResponseEntity<List<SalaryItemDetail>> getItemsByPeriod(
            @PathVariable Long periodId) {
        return ResponseEntity.ok(salaryService.getItemsByPeriod(periodId));
    }

    @GetMapping("/workers/{workerId}/items")
    @Operation(summary = "查詢師傅薪資歷史", description = "某師傅所有期別的領薪紀錄")
    public ResponseEntity<List<SalaryItemDetail>> getItemsByWorker(
            @PathVariable Long workerId) {
        return ResponseEntity.ok(salaryService.getItemsByWorker(workerId));
    }

    @PatchMapping("/items/{itemId}/adjust")
    @Operation(summary = "調整薪資明細", description = "手動加減金額，已付款或已結算不可調整")
    public ResponseEntity<SalaryItemDetail> adjustItem(
            @PathVariable Long itemId,
            @Valid @RequestBody SalaryItemAdjustRequest req) {
        return ResponseEntity.ok(salaryService.adjustItem(itemId, req));
    }

    @PatchMapping("/items/{itemId}/pay")
    @Operation(summary = "單筆標記付款", description = "個別項目標記已付，記錄付款時間")
    public ResponseEntity<SalaryItemDetail> markItemPaid(
            @PathVariable Long itemId) {
        return ResponseEntity.ok(salaryService.markItemPaid(itemId));
    }
}