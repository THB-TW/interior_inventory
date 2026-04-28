package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.WorkerBonusPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkerBonusPeriodRepository extends JpaRepository<WorkerBonusPeriod, Long> {
    // 取得區間內每位師傅的總出勤天數
    @Query("SELECT cw.worker.id, cw.worker.nickname, SUM(cw.daysWorked) " +
            "FROM CaseWorker cw " +
            "WHERE cw.workday BETWEEN :startDate AND :endDate " +
            "GROUP BY cw.worker.id, cw.worker.nickname")
    List<Object[]> sumDaysWorkedByWorkerGrouped(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}