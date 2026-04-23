package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.worker.CaseWorkerRequest;
import com.manage.interior_inventory.dto.worker.CaseWorkerResponse;
import com.manage.interior_inventory.dto.worker.WorkerProjectSummary;
import com.manage.interior_inventory.service.CaseWorkerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/caseworkers")
@RequiredArgsConstructor
@Tag(name = "師傅施工管理", description = "案件師傅施工紀錄 CRUD 及總覽查詢")
public class CaseWorkerController {

    private final CaseWorkerService caseWorkerService;

    @GetMapping
    @Operation(summary = "取得所有案件的師傅施工總覽", description = "回傳每個案件的工作天數、總工錢、總車馬費、總工人支出，以及每筆施工明細")
    public ApiResponse<List<WorkerProjectSummary>> getWorkerOverview() {
        return ApiResponse.success("查詢師傅施工總覽成功",
                caseWorkerService.getWorkerOverview());
    }

    @GetMapping("/{caseId}/workers")
    @Operation(summary = "取得單一案件的施工明細列表")
    public ApiResponse<List<CaseWorkerResponse>> getCaseWorkers(
            @PathVariable Long caseId) {
        return ApiResponse.success("查詢案件施工明細成功",
                caseWorkerService.getCaseWorkers(caseId));
    }

    @PostMapping("/{caseId}/workers")
    public ApiResponse<List<CaseWorkerResponse>> createCaseWorker(
            @PathVariable Long caseId,
            @Valid @RequestBody CaseWorkerRequest request) {
        return ApiResponse.success("新增施工紀錄成功",
                caseWorkerService.createCaseWorker(caseId, request));
    }

    @PutMapping("/{caseId}/workers/{caseWorkerId}")
    @Operation(summary = "更新一筆施工紀錄")
    public ApiResponse<CaseWorkerResponse> updateCaseWorker(
            @PathVariable Long caseId,
            @PathVariable Long caseWorkerId,
            @Valid @RequestBody CaseWorkerRequest request) {
        return ApiResponse.success("更新施工紀錄成功",
                caseWorkerService.updateCaseWorker(caseWorkerId, request));
    }

    @DeleteMapping("/{caseId}/workers/{caseWorkerId}")
    @Operation(summary = "刪除一筆施工紀錄")
    public ApiResponse<Void> deleteCaseWorker(
            @PathVariable Long caseId,
            @PathVariable Long caseWorkerId) {
        caseWorkerService.deleteCaseWorker(caseWorkerId);
        return ApiResponse.success("刪除施工紀錄成功");
    }
}