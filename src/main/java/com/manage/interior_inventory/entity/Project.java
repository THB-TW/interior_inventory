package com.manage.interior_inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

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

    @Column(name = "estimated_days")
    private Integer estimatedDays;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
