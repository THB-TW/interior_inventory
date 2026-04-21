package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.quote.QuoteUsageResponse;
import com.manage.interior_inventory.service.QuoteUsageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quote")
@RequiredArgsConstructor
@Tag(name = "報價 / 案件用料總覽", description = "提供報價用的案件用料狀況查詢 API")
public class QuoteController {

    private final QuoteUsageService quoteService;

    @GetMapping
    @Operation(summary = "取得案件用料/報價總覽列表", description = "只會回傳狀態為 已確認 / 施工中 / 驗收中 / 已結案 的案件，內容包含材料用量（進貨 / 剩料 / 退貨）")
    public ApiResponse<List<QuoteUsageResponse>> getQuoteUsage() {
        List<QuoteUsageResponse> data = quoteService.getQuoteUsageOverview();
        return ApiResponse.success("查詢報價/用料列表成功", data);
    }
}