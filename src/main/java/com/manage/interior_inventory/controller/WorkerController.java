package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.worker.WorkerRequest;
import com.manage.interior_inventory.dto.worker.WorkerResponse;
import com.manage.interior_inventory.service.WorkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;

    @GetMapping
    public ApiResponse<List<WorkerResponse>> getAllWorkers() {
        return ApiResponse.success("成功取得師傅列表", workerService.getAllWorkers());
    }

    @PostMapping
    public ApiResponse<WorkerResponse> createWorker(@Valid @RequestBody WorkerRequest request) {
        return ApiResponse.success("新增師傅成功", workerService.createWorker(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<WorkerResponse> updateWorker(
            @PathVariable Long id,
            @Valid @RequestBody WorkerRequest request) {
        return ApiResponse.success("更新師傅成功", workerService.updateWorker(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteWorker(@PathVariable Long id) {
        workerService.deleteWorker(id);
        return ApiResponse.success("刪除師傅成功", null);
    }
}
