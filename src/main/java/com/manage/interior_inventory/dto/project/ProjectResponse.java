package com.manage.interior_inventory.dto.project;

import com.manage.interior_inventory.entity.Project;
import com.manage.interior_inventory.entity.ProjectStatus;

import java.time.LocalDateTime;

public record ProjectResponse(
        Long id,
        String caseCode,
        String clientName,
        String clientPhone,
        String city,
        String district,
        String addressLine,
        String description,
        ProjectStatus status,
        Long salesUserId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
    public static ProjectResponse fromEntity(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getProjectCode(),
                project.getClientName(),
                project.getClientPhone(),
                project.getCity(),
                project.getDistrict(),
                project.getSiteAddress(),
                project.getDescription(),
                project.getStatus(),
                project.getSalesUserId(),
                project.getCreatedAt(),
                project.getUpdatedAt());
    }
}
