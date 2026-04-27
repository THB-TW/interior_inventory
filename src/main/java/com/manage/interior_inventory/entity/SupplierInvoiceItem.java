package com.manage.interior_inventory.entity;

import com.manage.interior_inventory.entity.enums.InvoiceItemMatchStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

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

    // 批次：0 = 退貨，1 以上 = 第幾批進貨
    @Column(name = "batch_no", nullable = false)
    private int batchNo;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    // nullable：比對不到系統材料時為 null
    @Column(name = "material_id")
    private Long materialId;

    @Column(name = "material_name_raw", nullable = false, length = 150)
    private String materialNameRaw;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    // 退貨為負值
    @Column(name = "quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    // 退貨為負值
    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status", nullable = false, length = 30)
    private InvoiceItemMatchStatus matchStatus;
}