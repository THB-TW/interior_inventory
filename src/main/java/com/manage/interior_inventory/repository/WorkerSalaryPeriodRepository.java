package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.WorkerSalaryPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkerSalaryPeriodRepository extends JpaRepository<WorkerSalaryPeriod, Long> {

    // 查詢所有期別，依開始日期倒序
    List<WorkerSalaryPeriod> findAllByOrderByPeriodStartDesc();

    // 依狀態查詢
    List<WorkerSalaryPeriod> findByStatusOrderByPeriodStartDesc(String status);

    // 防重複：建立前確認同區間是否已存在
    Optional<WorkerSalaryPeriod> findByPeriodStartAndPeriodEnd(LocalDate periodStart, LocalDate periodEnd);

    // 查某日期落在哪個期別（用於自動歸期）
    @Query("""
            SELECT p FROM WorkerSalaryPeriod p
            WHERE :date BETWEEN p.periodStart AND p.periodEnd
            """)
    Optional<WorkerSalaryPeriod> findByDate(@Param("date") LocalDate date);
}