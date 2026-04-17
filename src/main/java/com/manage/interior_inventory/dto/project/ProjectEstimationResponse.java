package com.manage.interior_inventory.dto.project;

import com.manage.interior_inventory.entity.ProjectEstimation;

import java.util.List;
import java.util.stream.Collectors;

public record ProjectEstimationResponse(
        Long id,
        Long projectId,
        Integer laborCost,
        Integer profit,
        Integer totalAmount,
        List<EstimationItemResponse> items,
        List<EstimationWorkerItemResponse> workerItems
) {
    public static ProjectEstimationResponse fromEntity(ProjectEstimation est) {
        return new ProjectEstimationResponse(
                est.getId(),
                est.getProjectId(),
                est.getLaborCost(),
                est.getProfit(),
                est.getTotalAmount(),
                est.getItems().stream().map(EstimationItemResponse::fromEntity).collect(Collectors.toList()),
                est.getWorkerItems().stream().map(EstimationWorkerItemResponse::fromEntity).collect(Collectors.toList())
        );
    }
}
