package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.CaseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CaseMaterialRepository extends JpaRepository<CaseMaterial, Long> {
    
    @Query("SELECT cm FROM CaseMaterial cm " +
           "JOIN FETCH cm.project p " +
           "JOIN FETCH cm.material m " +
           "WHERE m.id = :materialId AND p.status IN ('PENDING', 'IN_PROGRESS', 'CONTRACT_SIGNED')")
    List<CaseMaterial> findActiveNeedsByMaterialId(@Param("materialId") Long materialId);
}
