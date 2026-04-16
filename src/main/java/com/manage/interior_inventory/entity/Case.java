package com.manage.interior_inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "cases")
@Getter
@Setter
public class Case {
    // 標記這個欄位是主鍵（Primary Key）
    // 設定主鍵生成策略為 IDENTITY，通常對應到資料庫的 auto-increment
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_code", nullable = false, unique = true, length = 30)
    private String caseCode;

    @Column(name = "client_name", nullable = false, length = 100)
    private String clientName;

    @Column(name = "client_phone", length = 30)
    private String clientPhone;

    @Column(name = "site_address", nullable = false, length = 255)
    private String siteAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private CaseStatus status;

    @Column(name = "sales_user_id", nullable = false)
    private Long salesUserId;

    @Column(name = "estimated_days")
    private Integer estimatedDays;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // @PrePersist 是 JPA 的「生命週期回呼」註解之一
    // 這個方法會在實體「第一次要存進資料庫之前」自動被呼叫一次
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
