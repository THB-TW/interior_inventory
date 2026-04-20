package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Long> {
}
