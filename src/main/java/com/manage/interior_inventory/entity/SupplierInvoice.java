package com.manage.interior_inventory.entity;

import com.manage.interior_inventory.entity.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    @Column(name = "supplier_name", nullable = false, length = 100)
    private String supplierName;

    @Column(name = "invoice_number", nullable = false, length = 50)
    private String invoiceNumber;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private InvoiceStatus status;

    @Column(name = "uploaded_at", nullable = false)
    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "pdf_path", length = 255)
    private String pdfPath;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SupplierInvoiceItem> items = new ArrayList<>();

    public void addItem(SupplierInvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }
}
