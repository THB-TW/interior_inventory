package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.project.ProjectEstimationResponse;
import com.manage.interior_inventory.dto.project.ProjectEstimationSaveRequest;

public interface ProjectEstimationService {
    ProjectEstimationResponse getEstimationByProjectId(Long projectId);
    ProjectEstimationResponse saveEstimation(Long projectId, ProjectEstimationSaveRequest request);
}
