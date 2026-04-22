package com.manage.interior_inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "case_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "material_type", nullable = false, length = 20)
    @Builder.Default
    private CaseMaterialType materialType = CaseMaterialType.PURCHASE;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "line_cost", precision = 10, scale = 2)
    private BigDecimal lineCost;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ★ 新增：叫貨次數（同一案件每次叫貨遞增）
    @Column(name = "order_batch", nullable = false)
    @Builder.Default
    private Integer orderBatch = 1;
}
