package com.manage.interior_inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "worker_salary_periods")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerSalaryPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "label", nullable = false, length = 50)
    private String label;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // PENDING / CONFIRMED / PAID

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "period", fetch = FetchType.LAZY)
    private List<WorkerSalaryItem> items;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}