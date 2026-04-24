package com.manage.interior_inventory.entity;

import java.math.BigDecimal;
import java.util.List;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nickname", nullable = false, length = 50)
    private String nickname;

    @Column(name = "daily_wage", nullable = false)
    private Integer dailyWage;

    @Column(name = "wage_type", nullable = false, length = 20)
    private String wageType; // DAILY / PROJECT_SHARE

    @Column(name = "share_rate", precision = 5, scale = 4)
    private BigDecimal shareRate; // e.g. 0.0800

    @OneToMany(mappedBy = "worker", fetch = FetchType.LAZY)
    private List<WorkerSalaryItem> salaryItems;
}
