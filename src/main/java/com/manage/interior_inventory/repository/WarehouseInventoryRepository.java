package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.dto.warehouse.MatchedCaseDto;
import com.manage.interior_inventory.entity.WarehouseInventory;
import com.manage.interior_inventory.entity.WarehouseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarehouseInventoryRepository extends JpaRepository<WarehouseInventory, Long>, JpaSpecificationExecutor<WarehouseInventory> {

    @Query(value = "SELECT " +
            "w.id AS warehouseId, p.id AS caseId, p.client_name AS clientName, p.site_address AS fullAddress, cm.planned_quantity AS materialNeeded, m.unit AS unit " +
            "FROM warehouse_inventory w " +
            "JOIN materials m ON w.material_id = m.id " +
            "JOIN case_materials cm ON cm.material_id = m.id " +
            "JOIN projects p ON cm.case_id = p.id " +
            "WHERE w.status = 'AVAILABLE' AND cm.planned_quantity > 0", nativeQuery = true)
    List<Object[]> findMatchedCasesForAvailableInventoryRaw();

    @Query("SELECT w FROM WarehouseInventory w JOIN FETCH w.material WHERE w.status = com.manage.interior_inventory.entity.WarehouseStatus.AVAILABLE")
    List<WarehouseInventory> findAllAvailableWithMaterials();
}
