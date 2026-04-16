package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.Case;
import com.manage.interior_inventory.entity.CaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseRepository extends JpaRepository<Case, Long> {
    List<Case> findByStatus(CaseStatus status);
}
