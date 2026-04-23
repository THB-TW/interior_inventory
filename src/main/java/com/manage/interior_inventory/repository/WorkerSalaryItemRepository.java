package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.WorkerSalaryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkerSalaryItemRepository extends JpaRepository<WorkerSalaryItem, Long> {

    // 查某期別的所有明細
    List<WorkerSalaryItem> findByPeriodId(Long periodId);

    // 查某師傅的所有薪資明細（歷史記錄）
    List<WorkerSalaryItem> findByWorkerIdOrderByCreatedAtDesc(Long workerId);

    // 查某案件的所有薪資明細
    List<WorkerSalaryItem> findByProjectId(Long projectId);

    // 查某期別 + 某師傅（同期可能多筆）
    List<WorkerSalaryItem> findByPeriodIdAndWorkerId(Long periodId, Long workerId);

    // 分潤制防重複檢查（搭配 Partial Unique Index）
    Optional<WorkerSalaryItem> findByProjectIdAndWorkerIdAndWageType(
            Long projectId, Long workerId, String wageType);

    // 查某期別未付款的明細
    List<WorkerSalaryItem> findByPeriodIdAndIsPaidFalse(Long periodId);

    // 查某期別每位師傅的小計（彙總用）
    @Query("""
            SELECT i.worker.id, i.worker.nickname, i.wageType,
                   SUM(i.finalAmount) as total,
                   SUM(CASE WHEN i.isPaid = true THEN i.finalAmount ELSE 0 END) as paidTotal,
                   SUM(CASE WHEN i.isPaid = false THEN i.finalAmount ELSE 0 END) as unpaidTotal
            FROM WorkerSalaryItem i
            WHERE i.period.id = :periodId
            GROUP BY i.worker.id, i.worker.nickname, i.wageType
            ORDER BY i.worker.nickname
            """)
    List<Object[]> findWorkerSummaryByPeriodId(@Param("periodId") Long periodId);

    // 查某期別總金額
    @Query("""
            SELECT COALESCE(SUM(i.finalAmount), 0)
            FROM WorkerSalaryItem i
            WHERE i.period.id = :periodId
            """)
    java.math.BigDecimal sumFinalAmountByPeriodId(@Param("periodId") Long periodId);
}