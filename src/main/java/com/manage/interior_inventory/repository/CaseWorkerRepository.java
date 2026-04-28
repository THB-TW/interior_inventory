package com.manage.interior_inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.manage.interior_inventory.entity.CaseWorker;

import java.time.LocalDate;
import java.util.List;

public interface CaseWorkerRepository extends JpaRepository<CaseWorker, Long> {

       List<CaseWorker> findByProjectId(Long projectId);

       /**
        * 取所有案件的工人紀錄（總覽頁用，在 Service 層按 projectId group）。
        * 同時把 project 和 worker 都 fetch 出來。
        */
       @EntityGraph(attributePaths = { "project", "worker" })
       List<CaseWorker> findByProjectIdOrderByWorkdayAsc(Long projectId);

       /**
        * 依日期區間彙總每位師傅每個案子的薪資：
        * [0] workerId, [1] projectId, [2] SUM(dailyWage), [3] SUM(travelExpenses), [4]
        * SUM(mealAllowance)
        */
       @Query("""
                     SELECT c.worker.id,
                            c.project.id,
                            SUM(c.dailyWage),
                            SUM(c.travelExpenses),
                            SUM(c.mealAllowance)
                     FROM CaseWorker c
                     WHERE c.workday BETWEEN :start AND :end
                     GROUP BY c.worker.id, c.project.id
                     """)
       List<Object[]> sumByWorkerBetween(
                     @Param("start") LocalDate start,
                     @Param("end") LocalDate end);

       // === 新增的：專門用來算節慶獎金 (依據師傅分組，並加總「天數」) ===
       @Query("SELECT cw.worker.id, cw.worker.nickname, SUM(cw.daysWorked) " +
                     "FROM CaseWorker cw " +
                     "WHERE cw.workday BETWEEN :startDate AND :endDate " +
                     "GROUP BY cw.worker.id, cw.worker.nickname")
       List<Object[]> sumDaysWorkedByWorkerGrouped(
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);
}