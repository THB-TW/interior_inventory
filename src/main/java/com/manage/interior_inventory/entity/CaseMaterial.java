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
    private Project project; // The table says `cases` conceptually but maps to `projects`

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "planned_quantity", nullable = false)
    private BigDecimal plannedQuantity;

    @Column(name = "locked_quantity", nullable = false)
    private BigDecimal lockedQuantity;

    @Column(name = "actual_quantity", nullable = false)
    private BigDecimal actualQuantity;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @Column(name = "line_cost")
    private BigDecimal lineCost;
}
