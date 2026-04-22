package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.dto.quote.QuoteMaterialResponse;
import com.manage.interior_inventory.dto.quote.QuoteUsageResponse;
import com.manage.interior_inventory.dto.quote.QuoteMaterialRequset;
import com.manage.interior_inventory.dto.quote.QuoteMaterialLineResponse;
import com.manage.interior_inventory.entity.CaseMaterial;
import com.manage.interior_inventory.entity.CaseMaterialType;
import com.manage.interior_inventory.entity.Project;
import com.manage.interior_inventory.entity.ProjectStatus;
import com.manage.interior_inventory.entity.Material;
import com.manage.interior_inventory.repository.CaseMaterialRepository;
import com.manage.interior_inventory.repository.ProjectRepository;
import com.manage.interior_inventory.repository.MaterialRepository;
import com.manage.interior_inventory.service.QuoteUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class QuoteUsageServiceImpl implements QuoteUsageService {

    private final ProjectRepository projectRepository;
    private final CaseMaterialRepository caseMaterialRepository;
    private final MaterialRepository materialRepository;

    @Override
    @Transactional(readOnly = true)
    public List<QuoteUsageResponse> getQuoteUsageOverview() {
        // 只撈出「已確認 / 施工中 / 驗收中 / 已結案」四種狀態
        List<Project> projects = projectRepository.findByStatusIn(List.of(
                ProjectStatus.CONFIRMED,
                ProjectStatus.IN_PROGRESS,
                ProjectStatus.INSPECTION,
                ProjectStatus.CLOSED));

        List<QuoteUsageResponse> result = new ArrayList<>();
        for (Project project : projects) {
            result.add(buildUsageForProject(project));
        }
        return result;
    }

    // 單一案件用料 / 報價總覽
    @Override
    @Transactional(readOnly = true)
    public List<QuoteUsageResponse> getProjectQuoteUsage(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("找不到案件，id=" + projectId));

        List<QuoteUsageResponse> result = new ArrayList<>();
        result.add(buildUsageForProject(project));
        return result;
    }

    // ====== 案件用料 CRUD ======

    @Override
    @Transactional
    public QuoteUsageResponse createProjectMaterial(Long projectId, QuoteMaterialRequset request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("找不到案件，id=" + projectId));

        Material material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new IllegalArgumentException("找不到材料，id=" + request.getMaterialId()));

        int quantity = Optional.ofNullable(request.getQuantity()).orElse(0);
        CaseMaterialType materialType = Optional.ofNullable(request.getMaterialType())
                .orElse(CaseMaterialType.PURCHASE);

        BigDecimal unitPrice = material.getDefaultPrice(); // 暫時用材料預設單價
        BigDecimal lineCost = (unitPrice != null)
                ? unitPrice.multiply(BigDecimal.valueOf(quantity))
                : null;

        CaseMaterial caseMaterial = CaseMaterial.builder()
                .project(project)
                .material(material)
                .quantity(quantity)
                .materialType(materialType)
                .unitPrice(unitPrice)
                .lineCost(lineCost)
                .build();

        caseMaterialRepository.save(caseMaterial);

        return buildUsageForProject(project);
    }

    @Override
    @Transactional
    public QuoteUsageResponse updateProjectMaterial(Long projectId,
            Long caseMaterialId,
            QuoteMaterialRequset request) {
        CaseMaterial caseMaterial = caseMaterialRepository.findById(caseMaterialId)
                .orElseThrow(() -> new IllegalArgumentException("找不到案件用料，id=" + caseMaterialId));

        Project project = caseMaterial.getProject();
        if (!Objects.equals(project.getId(), projectId)) {
            throw new IllegalArgumentException("案件 ID 不一致，無法更新該用料");
        }

        // 若允許改材料
        if (request.getMaterialId() != null &&
                !Objects.equals(request.getMaterialId(), caseMaterial.getMaterial().getId())) {
            Material material = materialRepository.findById(request.getMaterialId())
                    .orElseThrow(() -> new IllegalArgumentException("找不到材料，id=" + request.getMaterialId()));
            caseMaterial.setMaterial(material);
            caseMaterial.setUnitPrice(material.getDefaultPrice());
        }

        if (request.getMaterialType() != null) {
            caseMaterial.setMaterialType(request.getMaterialType());
        }

        if (request.getQuantity() != null) {
            caseMaterial.setQuantity(request.getQuantity());
        }

        // 更新單行 lineCost = quantity * unitPrice
        BigDecimal unitPrice = caseMaterial.getUnitPrice();
        Integer qty = caseMaterial.getQuantity();
        if (unitPrice != null && qty != null) {
            caseMaterial.setLineCost(unitPrice.multiply(BigDecimal.valueOf(qty)));
        } else {
            caseMaterial.setLineCost(null);
        }

        caseMaterialRepository.save(caseMaterial);

        return buildUsageForProject(project);
    }

    @Override
    @Transactional
    public void deleteProjectMaterial(Long projectId, Long caseMaterialId) {
        CaseMaterial caseMaterial = caseMaterialRepository.findById(caseMaterialId)
                .orElseThrow(() -> new IllegalArgumentException("找不到案件用料，id=" + caseMaterialId));

        Project project = caseMaterial.getProject();
        if (!Objects.equals(project.getId(), projectId)) {
            throw new IllegalArgumentException("案件 ID 不一致，無法刪除該用料");
        }

        caseMaterialRepository.delete(caseMaterial);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteMaterialLineResponse> getCaseMaterialLines(Long projectId) {
        List<CaseMaterial> lines = caseMaterialRepository
                .findByProjectIdOrderByMaterialId(projectId);

        List<QuoteMaterialLineResponse> result = new ArrayList<>();
        for (CaseMaterial cm : lines) {
            BigDecimal lineCost = null;
            if (cm.getUnitPrice() != null && cm.getQuantity() != null) {
                lineCost = cm.getUnitPrice()
                        .multiply(BigDecimal.valueOf(cm.getQuantity()));
            }
            result.add(QuoteMaterialLineResponse.builder()
                    .caseMaterialId(cm.getId())
                    .materialId(cm.getMaterial().getId())
                    .materialName(cm.getMaterial().getName())
                    .materialType(cm.getMaterialType())
                    .quantity(cm.getQuantity())
                    .unitPrice(cm.getUnitPrice())
                    .lineCost(lineCost)
                    .build());
        }
        return result;
    }

    // ====== 共用聚合邏輯 ======

    /**
     * 把某案件底下的 CaseMaterial 聚合成 QuoteUsageResponse，
     * 包含：purchase / leftover / return、totalQuantity、unitPrice、lineCost。
     */
    private QuoteUsageResponse buildUsageForProject(Project project) {
        List<CaseMaterial> lines = caseMaterialRepository.findByProject_Id(project.getId());

        // materialId -> 聚合結果
        Map<Long, AggregatedMaterial> aggregated = new LinkedHashMap<>();

        for (CaseMaterial cm : lines) {
            Long materialId = cm.getMaterial().getId();

            AggregatedMaterial agg = aggregated.computeIfAbsent(materialId, id -> {
                AggregatedMaterial a = new AggregatedMaterial();
                a.caseMaterialId = cm.getId();
                a.materialId = id;
                a.materialName = cm.getMaterial().getName();
                return a;
            });

            int qty = Optional.ofNullable(cm.getQuantity()).orElse(0);
            CaseMaterialType type = cm.getMaterialType();

            switch (type) {
                case PURCHASE -> agg.purchaseQuantity += qty;
                case LEFTOVER -> agg.leftoverQuantity += qty;
                case RETURN -> agg.returnQuantity += qty;
            }

            // 只要還沒設定 unitPrice，就拿第一個有值的
            if (agg.unitPrice == null && cm.getUnitPrice() != null) {
                agg.unitPrice = cm.getUnitPrice();
            }
        }

        List<QuoteMaterialResponse> materialDtos = new ArrayList<>();
        for (AggregatedMaterial agg : aggregated.values()) {
            int total = agg.purchaseQuantity + agg.leftoverQuantity - agg.returnQuantity;

            BigDecimal lineCost = null;
            if (agg.unitPrice != null && total != 0) {
                lineCost = agg.unitPrice.multiply(BigDecimal.valueOf(total));
            }

            materialDtos.add(QuoteMaterialResponse.builder()
                    .caseMaterialId(agg.caseMaterialId)
                    .materialId(agg.materialId)
                    .materialName(agg.materialName)
                    .purchaseQuantity(agg.purchaseQuantity)
                    .leftoverQuantity(agg.leftoverQuantity)
                    .returnQuantity(agg.returnQuantity)
                    .totalQuantity(total)
                    .unitPrice(agg.unitPrice) // 你要先在 DTO 加上這兩個欄位
                    .lineCost(lineCost)
                    .build());
        }

        return QuoteUsageResponse.builder()
                .projectId(project.getId())
                .projectCode(project.getProjectCode())
                .status(project.getStatus())
                .clientName(project.getClientName())
                .address(project.getSiteAddress())
                .description(project.getDescription())
                .materials(materialDtos)
                .build();
    }

    /**
     * 聚合用的內部類別。
     */
    private static class AggregatedMaterial {
        Long caseMaterialId;
        Long materialId;
        String materialName;
        int purchaseQuantity;
        int leftoverQuantity;
        int returnQuantity;
        BigDecimal unitPrice;
    }
}