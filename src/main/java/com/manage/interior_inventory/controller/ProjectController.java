package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.project.ProjectCreateRequest;
import com.manage.interior_inventory.dto.project.ProjectResponse;
import com.manage.interior_inventory.entity.ProjectStatus;
import com.manage.interior_inventory.service.ProjectService;
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

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "案件管理", description = "提供案件的新增、查詢、修改與狀態流轉 API")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "新增案件", description = "建立一筆新的室內裝潢案件，初始狀態預設為 INQUIRY")
    public ApiResponse<ProjectResponse> createProject(@RequestBody @Valid ProjectCreateRequest request) {
        ProjectResponse response = projectService.createProject(request);
        return ApiResponse.success("新增案件成功", response);
    }

    @GetMapping
    @Operation(summary = "查詢案件清單", description = "支援分頁與多條件篩選 (客戶姓名模糊搜尋、縣市、區域、狀態)")
    public ApiResponse<Page<ProjectResponse>> getProjects(
            @Parameter(description = "客戶姓名 (模糊搜尋)") @RequestParam(required = false) String clientName,
            @Parameter(description = "縣市") @RequestParam(required = false) String city,
            @Parameter(description = "區域") @RequestParam(required = false) String district,
            @Parameter(description = "案件狀態") @RequestParam(required = false) ProjectStatus status,
            @Parameter(description = "分頁參數 (預設第0頁，每頁10筆，依建立時間遞減)") 
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<ProjectResponse> pageResult = projectService.getProjects(clientName, city, district, status, pageable);
        return ApiResponse.success("查詢成功", pageResult);
    }

    @GetMapping("/{id}")
    @Operation(summary = "查詢單一案件詳情", description = "透過案件 ID 取得詳細資訊")
    public ApiResponse<ProjectResponse> getProjectById(
            @Parameter(description = "案件 ID", required = true) @PathVariable Long id) {
        ProjectResponse response = projectService.getProjectById(id);
        return ApiResponse.success("查詢成功", response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "編輯案件基本資料", description = "修改案件資訊 (不包含狀態)")
    public ApiResponse<ProjectResponse> updateProject(
            @Parameter(description = "案件 ID", required = true) @PathVariable Long id,
            @RequestBody @Valid ProjectCreateRequest request) {
        ProjectResponse response = projectService.updateProject(id, request);
        return ApiResponse.success("更新案件成功", response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "變更案件狀態", description = "推動案件進入下一個階段 (需符合狀態機合理流轉規則)")
    public ApiResponse<Void> updateProjectStatus(
            @Parameter(description = "案件 ID", required = true) @PathVariable Long id,
            @Parameter(description = "目標狀態", required = true) @RequestParam ProjectStatus nextStatus) {
        projectService.updateProjectStatus(id, nextStatus);
        return ApiResponse.success("狀態變更成功");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "取消案件 (軟刪除)", description = "將案件狀態變更為 CANCELLED，並非實體刪除")
    public ApiResponse<Void> cancelProject(
            @Parameter(description = "案件 ID", required = true) @PathVariable Long id) {
        projectService.cancelProject(id);
        return ApiResponse.success("案件已取消");
    }
}
