package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.WarehouseInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

public interface WarehouseInventoryRepository extends JpaRepository<WarehouseInventory, Long> {
    
    @EntityGraph(attributePaths = {"material"})
    List<WarehouseInventory> findAll();
}
