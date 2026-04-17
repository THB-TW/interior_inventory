package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.project.ProjectEstimationResponse;
import com.manage.interior_inventory.dto.project.ProjectEstimationSaveRequest;
import com.manage.interior_inventory.service.ProjectEstimationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/estimation")
@RequiredArgsConstructor
public class ProjectEstimationController {

    private final ProjectEstimationService estimationService;

    @GetMapping
    public ApiResponse<ProjectEstimationResponse> getEstimation(@PathVariable Long projectId) {
        ProjectEstimationResponse response = estimationService.getEstimationByProjectId(projectId);
        return ApiResponse.success("成功取得估價", response); // response can be null if not found
    }

    @PutMapping
    public ApiResponse<ProjectEstimationResponse> saveEstimation(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectEstimationSaveRequest request) {
        return ApiResponse.success("儲存估價成功", estimationService.saveEstimation(projectId, request));
    }
}
