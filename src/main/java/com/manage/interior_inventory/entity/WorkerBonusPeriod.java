package com.manage.interior_inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "worker_bonus_periods")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerBonusPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(name = "daily_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // 與明細表建立一對多關聯，加上 cascade 確保儲存主檔時連同明細一起存
    @OneToMany(mappedBy = "period", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude // 避免 Lombok 的 toString 造成無限迴圈
    private List<WorkerBonusItem> items = new ArrayList<>();

    // 輔助方法：用來雙向綁定關聯
    public void addItem(WorkerBonusItem item) {
        items.add(item);
        item.setPeriod(this);
    }
}