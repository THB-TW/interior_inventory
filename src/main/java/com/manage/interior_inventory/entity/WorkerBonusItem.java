package com.manage.interior_inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "worker_bonus_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerBonusItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 多對一：關聯回發放週期主檔
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    @ToString.Exclude
    private WorkerBonusPeriod period;

    // 多對一：關聯到現有的師傅 Entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    @ToString.Exclude
    private Worker worker;

    @Column(name = "total_days", nullable = false, precision = 10, scale = 1)
    private BigDecimal totalDays;

    @Column(name = "calculated_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal calculatedAmount;

    @Column(name = "actual_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal actualAmount;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}