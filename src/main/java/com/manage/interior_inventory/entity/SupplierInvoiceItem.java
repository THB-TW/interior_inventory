package com.manage.interior_inventory.entity;

import com.manage.interior_inventory.entity.enums.InvoiceItemMatchStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "supplier_invoice_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierInvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_invoice_id", nullable = false)
    private SupplierInvoice invoice;

    @Column(name = "material_name", nullable = false, length = 100)
    private String materialName;

    @Column(name = "specification", length = 100)
    private String specification;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    @Column(name = "quantity", precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "is_return", nullable = false)
    @Builder.Default
    private boolean isReturn = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status", nullable = false, length = 30)
    private InvoiceItemMatchStatus matchStatus;

    @Column(name = "case_material_id")
    private Long caseMaterialId;
}
