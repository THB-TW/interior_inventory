package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkerRepository extends JpaRepository<Worker, Long> {
}
