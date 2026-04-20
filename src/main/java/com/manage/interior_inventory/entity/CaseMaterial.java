package com.manage.interior_inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

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

    @Column(name = "planned_quantity", nullable = false)
    @Builder.Default
    private Integer plannedQuantity = 0;

    @Column(name = "locked_quantity", nullable = false)
    @Builder.Default
    private Integer lockedQuantity = 0;

    @Column(name = "actual_quantity", nullable = false)
    @Builder.Default
    private Integer actualQuantity = 0;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "line_cost", precision = 10, scale = 2)
    private BigDecimal lineCost;
}
