package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.project.ContractUpdateRequest;
import com.manage.interior_inventory.dto.project.ProjectCreateRequest;
import com.manage.interior_inventory.dto.project.ProjectResponse;
import com.manage.interior_inventory.entity.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectService {

    ProjectResponse createProject(ProjectCreateRequest request);

    Page<ProjectResponse> getProjects(String clientName, String city, String district, ProjectStatus status,
            Pageable pageable);

    ProjectResponse getProjectById(Long id);

    ProjectResponse updateProject(Long id, ProjectCreateRequest request);

    void updateProjectStatus(Long id, ProjectStatus nextStatus);

    void cancelProject(Long id);

    void updateContractInfo(Long id, ContractUpdateRequest request);
}
