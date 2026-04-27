package com.manage.interior_inventory.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "case_workers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseWorker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private Worker worker;

    @Column(name = "daily_wage", nullable = false)
    private BigDecimal dailyWage;

    @Column(name = "workday", nullable = false)
    private LocalDate workday;

    @Column(name = "travel_expenses", nullable = false)
    private BigDecimal travelExpenses;

    @Column(name = "meal_allowance", nullable = false)
    private BigDecimal mealAllowance;

    @Column(name = "days_worked", nullable = false, precision = 3, scale = 1)
    private BigDecimal daysWorked;
}
