package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.dto.quote.QuoteMaterialResponse;
import com.manage.interior_inventory.dto.quote.QuoteUsageResponse;
import com.manage.interior_inventory.entity.CaseMaterial;
import com.manage.interior_inventory.entity.CaseMaterialType;
import com.manage.interior_inventory.entity.Project;
import com.manage.interior_inventory.entity.ProjectStatus;
import com.manage.interior_inventory.repository.CaseMaterialRepository;
import com.manage.interior_inventory.repository.ProjectRepository;
import com.manage.interior_inventory.service.QuoteUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class QuoteUsageServiceImpl implements QuoteUsageService {

    private final ProjectRepository projectRepository;
    private final CaseMaterialRepository caseMaterialRepository;

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
            List<CaseMaterial> lines = caseMaterialRepository.findByProject_Id(project.getId());

            Map<Long, QuoteMaterialResponse.QuoteMaterialResponseBuilder> builderMap = new LinkedHashMap<>();

            for (CaseMaterial cm : lines) {
                Long materialId = cm.getMaterial().getId();
                QuoteMaterialResponse.QuoteMaterialResponseBuilder builder = builderMap.getOrDefault(materialId,
                        QuoteMaterialResponse.builder()
                                .materialId(materialId)
                                .materialName(cm.getMaterial().getName())
                                .purchaseQuantity(0)
                                .leftoverQuantity(0)
                                .returnQuantity(0));

                int qty = cm.getQuantity();
                CaseMaterialType type = cm.getMaterialType();

                switch (type) {
                    case PURCHASE -> builder.purchaseQuantity(builder.build().getPurchaseQuantity() + qty);
                    case LEFTOVER -> builder.leftoverQuantity(builder.build().getLeftoverQuantity() + qty);
                    case RETURN -> builder.returnQuantity(builder.build().getReturnQuantity() + qty);
                }

                builderMap.put(materialId, builder);
            }

            List<QuoteMaterialResponse> materialDtos = new ArrayList<>();
            for (QuoteMaterialResponse.QuoteMaterialResponseBuilder b : builderMap.values()) {
                QuoteMaterialResponse tmp = b.build();
                int total = tmp.getPurchaseQuantity()
                        + tmp.getLeftoverQuantity()
                        - tmp.getReturnQuantity();

                materialDtos.add(tmp.toBuilder().totalQuantity(total).build());
            }

            result.add(QuoteUsageResponse.builder()
                    .projectId(project.getId())
                    .projectCode(project.getProjectCode())
                    .status(project.getStatus())
                    .clientName(project.getClientName())
                    .address(project.getSiteAddress())
                    .description(project.getDescription())
                    .materials(materialDtos)
                    .build());
        }

        return result;
    }
}
