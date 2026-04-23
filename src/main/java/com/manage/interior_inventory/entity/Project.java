package com.manage.interior_inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_code", nullable = false, unique = true, length = 30)
    private String projectCode;

    @Column(name = "client_name", nullable = false, length = 100)
    private String clientName;

    @Column(name = "client_phone", length = 30)
    private String clientPhone;

    @Column(name = "city", nullable = false, length = 30)
    private String city;

    @Column(name = "district", length = 30)
    private String district;

    @Column(name = "site_address", length = 255, nullable = false)
    private String siteAddress;

    @Column(columnDefinition = "TEXT")
    private String description;

    // 狀態 (Enum 方案 3)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ProjectStatus status;

    @Column(name = "sales_user_id", nullable = false)
    private Long salesUserId;

    @Column(name = "order_batch")
    private Integer orderBatch;

    @Column(name = "estimated_days")
    private Integer estimatedDays;

    @Column(name = "contract_amount", precision = 10, scale = 2)
    private BigDecimal contractAmount; // 合約金額（nullable，尚未填時為 null）

    @Column(name = "received_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal receivedAmount = BigDecimal.ZERO; // 已收款

    @Column(name = "payment_status", length = 20)
    @Builder.Default
    private String paymentStatus = "PENDING"; // PENDING / PARTIAL / COMPLETED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<CaseMaterial> caseMaterials = new java.util.ArrayList<>();
}
