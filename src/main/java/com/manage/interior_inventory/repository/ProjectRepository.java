package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.Project;
import com.manage.interior_inventory.entity.ProjectStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    // Spring Data JPA 會自動實作基本操作：findById, save, delete 等
    // 透過 JpaSpecificationExecutor 讓我們有 findAll(Specification, Pageable) 的能力，實作多條件篩選

    // 找出指定前綴（例如 IP-202604-）下的最大案號
    @Query("SELECT MAX(p.projectCode) FROM Project p WHERE p.projectCode LIKE :prefix%")
    String findMaxProjectCodeByPrefix(@Param("prefix") String prefix);

    List<Project> findByStatusIn(List<ProjectStatus> statuses);

}
