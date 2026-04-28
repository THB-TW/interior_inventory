package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.bonus.BonusConfirmRequest;
import com.manage.interior_inventory.dto.bonus.BonusPreviewResponse;
import com.manage.interior_inventory.service.WorkerBonusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finance/bonus")
@RequiredArgsConstructor
@Tag(name = "財務模組 - 師傅節慶獎金", description = "提供獎金試算預覽與確認發放功能")
public class WorkerBonusController {

    private final WorkerBonusService workerBonusService;

    @GetMapping("/preview")
    @Operation(summary = "預覽獎金試算", description = "根據日期區間與每日基準，撈取師傅出勤天數並試算獎金")
    public ApiResponse<List<BonusPreviewResponse>> previewBonus(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "100.00") BigDecimal dailyRate) {

        // 呼叫 Service 執行核心邏輯
        List<BonusPreviewResponse> result = workerBonusService.previewBonus(startDate, endDate, dailyRate);

        // 將結果包裝進你定義的 ApiResponse 中回傳
        return ApiResponse.success("獎金試算預覽成功", result);
    }

    @PostMapping("/confirm")
    @Operation(summary = "確認並發放獎金", description = "接收老闆微調後的獎金名單，並固化寫入資料庫中")
    public ApiResponse<Void> confirmBonus(@Valid @RequestBody BonusConfirmRequest request) {

        // 呼叫 Service 執行存檔邏輯
        workerBonusService.confirmBonus(request);

        // 存檔成功，不需回傳資料本體，給予成功訊息即可
        return ApiResponse.success("獎金發放紀錄已成功儲存", null);
    }
}