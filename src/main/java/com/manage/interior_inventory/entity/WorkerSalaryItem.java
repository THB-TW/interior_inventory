package com.manage.interior_inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "worker_salary_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerSalaryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 分潤制可 NULL
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id")
    private WorkerSalaryPeriod period;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    // 日薪制可跨多案，分潤制必填
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "wage_type", nullable = false, length = 20)
    private String wageType; // DAILY / PROJECT_SHARE

    @Column(name = "base_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseAmount;

    @Column(name = "travel_expenses", nullable = false, precision = 10, scale = 2)
    private BigDecimal travelExpenses;

    @Column(name = "adjustment", nullable = false, precision = 10, scale = 2)
    private BigDecimal adjustment;

    @Column(name = "final_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.travelExpenses == null)
            this.travelExpenses = BigDecimal.ZERO;
        if (this.adjustment == null)
            this.adjustment = BigDecimal.ZERO;
        if (this.isPaid == null)
            this.isPaid = false;
    }
}