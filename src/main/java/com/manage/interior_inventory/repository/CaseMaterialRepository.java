package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.CaseMaterial;
import com.manage.interior_inventory.entity.CaseMaterialType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CaseMaterialRepository extends JpaRepository<CaseMaterial, Long> {

        @Query("SELECT cm FROM CaseMaterial cm " +
                        "JOIN FETCH cm.project p " +
                        "JOIN FETCH cm.material m " +
                        "WHERE m.id = :materialId AND p.status IN ('QUOTING', 'CONFIRMED', 'IN_PROGRESS', 'INSPECTION')")
        List<CaseMaterial> findActiveNeedsByMaterialId(@Param("materialId") Long materialId);

        /**
         * 給「案件用料狀況」頁用：取某案件所有用料（一次把 material 一起抓出來）。
         */
        @EntityGraph(attributePaths = { "material" })
        List<CaseMaterial> findByProject_Id(Long projectId);

        /**
         * 給剩料拆分邏輯用：
         * 找出「某案件 + 某材料 + 指定來源類型」的一筆 case_material（例如 PURCHASE）。
         */
        Optional<CaseMaterial> findFirstByProjectIdAndMaterialIdAndMaterialType(
                        Long projectId,
                        Long materialId,
                        CaseMaterialType materialType);

        @EntityGraph(attributePaths = { "material" })
        List<CaseMaterial> findByProjectIdOrderByMaterialId(Long projectId);
}
