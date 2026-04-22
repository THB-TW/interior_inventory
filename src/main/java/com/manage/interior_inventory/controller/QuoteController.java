package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.quote.QuoteMaterialRequset;
import com.manage.interior_inventory.dto.quote.QuoteUsageResponse;
import com.manage.interior_inventory.dto.quote.QuoteMaterialLineResponse;
import com.manage.interior_inventory.service.QuoteUsageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RestController
@RequestMapping("/api/quote")
@RequiredArgsConstructor
@Tag(name = "報價 / 案件用料總覽", description = "提供報價用的案件用料狀況查詢 API")
public class QuoteController {

    private final QuoteUsageService quoteUsageService;

    @GetMapping
    @Operation(summary = "取得案件用料/報價總覽列表", description = "只會回傳狀態為 已確認 / 施工中 / 驗收中 / 已結案 的案件，內容包含材料用量（進貨 / 剩料 / 退貨）")
    public ApiResponse<List<QuoteUsageResponse>> getQuoteUsage() {
        List<QuoteUsageResponse> data = quoteUsageService.getQuoteUsageOverview();
        return ApiResponse.success("查詢報價/用料列表成功", data);
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "取得單一案件的用料/報價總覽", description = "以 projectId 查詢某一案件的用料狀況（結構與列表相同，但只回傳此案件）")
    public ApiResponse<List<QuoteUsageResponse>> getProjectQuoteUsage(@PathVariable Long projectId) {
        List<QuoteUsageResponse> data = quoteUsageService.getProjectQuoteUsage(projectId);
        return ApiResponse.success("查詢單一案件報價/用料成功", data);
    }

    @PostMapping("/{projectId}/casematerials")
    @Operation(summary = "新增某案件的一筆用料", description = "在指定案件底下新增一筆 CaseMaterial（進貨 / 剩料 / 退貨），回傳更新後的該案件用料總覽")
    public ApiResponse<QuoteUsageResponse> createProjectMaterial(
            @PathVariable Long projectId,
            @Valid @RequestBody QuoteMaterialRequset request) {
        QuoteUsageResponse data = quoteUsageService.createProjectMaterial(projectId, request);
        return ApiResponse.success("新增案件用料成功", data);
    }

    @PutMapping("/{projectId}/casematerials/{caseMaterialId}")
    @Operation(summary = "更新某案件的一筆用料", description = "更新指定案件底下某一筆 CaseMaterial 的材料 / 類型 / 數量，回傳更新後的該案件用料總覽")
    public ApiResponse<QuoteUsageResponse> updateProjectMaterial(
            @PathVariable Long projectId,
            @PathVariable Long caseMaterialId,
            @Valid @RequestBody QuoteMaterialRequset request) {
        QuoteUsageResponse data = quoteUsageService.updateProjectMaterial(projectId, caseMaterialId, request);
        return ApiResponse.success("更新案件用料成功", data);
    }

    @DeleteMapping("/{projectId}/casematerials/{caseMaterialId}")
    @Operation(summary = "刪除某案件的一筆用料", description = "刪除指定案件底下的一筆 CaseMaterial，不回傳資料內容")
    public ApiResponse<Void> deleteProjectMaterial(
            @PathVariable Long projectId,
            @PathVariable Long caseMaterialId) {
        quoteUsageService.deleteProjectMaterial(projectId, caseMaterialId);
        return ApiResponse.success("刪除案件用料成功");
    }

    @GetMapping("/{projectId}/casematerials")
    @Operation(summary = "取得某案件的所有用料明細（每筆獨立）")
    public ApiResponse<List<QuoteMaterialLineResponse>> getCaseMaterialLines(
            @PathVariable Long projectId) {
        return ApiResponse.success("查詢案件用料明細成功",
                quoteUsageService.getCaseMaterialLines(projectId));
    }
}