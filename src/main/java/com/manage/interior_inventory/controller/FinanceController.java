package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.finance.ProjectProfitDTO;
import com.manage.interior_inventory.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping("/projects")
    public ApiResponse<List<ProjectProfitDTO>> getAllProfits() {
        return ApiResponse.success("查詢成功", financeService.getAllProjectProfits());
    }

    @GetMapping("/projects/{id}")
    public ApiResponse<ProjectProfitDTO> getProfit(@PathVariable Long id) {
        return ApiResponse.success("查詢成功", financeService.getProjectProfit(id));
    }
}