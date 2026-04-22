package com.manage.interior_inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import com.manage.interior_inventory.entity.CaseWorker;

import java.util.List;

public interface CaseWorkerRepository extends JpaRepository<CaseWorker, Long> {

    List<CaseWorker> findByProjectId(Long projectId);

    /**
     * 取所有案件的工人紀錄（總覽頁用，在 Service 層按 projectId group）。
     * 同時把 project 和 worker 都 fetch 出來。
     */
    @EntityGraph(attributePaths = { "project", "worker" })
    List<CaseWorker> findByProjectIdOrderByWorkdayAsc(Long projectId);
}