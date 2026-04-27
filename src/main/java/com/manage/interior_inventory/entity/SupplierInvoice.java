package com.manage.interior_inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "supplier_invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "pdf_path", length = 255)
    private String pdfPath;

    @Column(name = "delivery_address", length = 255)
    private String deliveryAddress;

    @Column(name = "receivable_amount", precision = 10, scale = 2)
    private BigDecimal receivableAmount; // 應收總額

    @Column(name = "cash_discount", precision = 10, scale = 2)
    private BigDecimal cashDiscount; // 現金扣款

    @Column(name = "net_payable", precision = 10, scale = 2)
    private BigDecimal netPayable; // 付現應收

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SupplierInvoiceItem> items = new ArrayList<>();

    public void addItem(SupplierInvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }
}