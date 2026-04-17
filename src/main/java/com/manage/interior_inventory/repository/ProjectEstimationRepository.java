package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.ProjectEstimation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProjectEstimationRepository extends JpaRepository<ProjectEstimation, Long> {
    Optional<ProjectEstimation> findByProjectId(Long projectId);
}
