package com.manage.interior_inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project_estimations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectEstimation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false, unique = true)
    private Long projectId;

    @Column(name = "labor_cost", nullable = false)
    private Integer laborCost;

    @Column(name = "profit", nullable = false)
    private Integer profit;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @OneToMany(mappedBy = "estimation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EstimationItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "estimation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EstimationWorkerItem> workerItems = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
