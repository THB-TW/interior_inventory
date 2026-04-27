package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    @Query("SELECT DISTINCT m.unit FROM Material m WHERE m.isActive = true AND m.unit IS NOT NULL AND m.unit <> ''")
    List<String> findAllDistinctUnits();
}
