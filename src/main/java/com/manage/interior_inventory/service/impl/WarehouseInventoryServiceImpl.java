package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.common.exception.BusinessException;
import com.manage.interior_inventory.dto.inventory.InventorySuggestionResponse;
import com.manage.interior_inventory.dto.inventory.WarehouseInventoryRequest;
import com.manage.interior_inventory.dto.inventory.WarehouseInventoryResponse;
import com.manage.interior_inventory.entity.WarehouseStatus;
import com.manage.interior_inventory.entity.Material;
import com.manage.interior_inventory.entity.Project;
import com.manage.interior_inventory.entity.WarehouseInventory;
import com.manage.interior_inventory.entity.CaseMaterial;
import com.manage.interior_inventory.entity.CaseMaterialType;
import com.manage.interior_inventory.repository.CaseMaterialRepository;
import com.manage.interior_inventory.repository.MaterialRepository;
import com.manage.interior_inventory.repository.ProjectRepository;
import com.manage.interior_inventory.repository.WarehouseInventoryRepository;
import com.manage.interior_inventory.service.WarehouseInventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseInventoryServiceImpl implements WarehouseInventoryService {

    private final WarehouseInventoryRepository inventoryRepository;
    private final MaterialRepository materialRepository;
    private final CaseMaterialRepository caseMaterialRepository;
    private final ProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseInventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(WarehouseInventoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WarehouseInventoryResponse createInventory(WarehouseInventoryRequest request) {
        Material material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new BusinessException("找不到指定的材料 ID: " + request.getMaterialId()));

        WarehouseInventory inventory = WarehouseInventory.builder()
                .material(material)
                .quantity(request.getQuantity())
                .location(request.getLocation())
                .status(request.getStatus() != null ? request.getStatus() : WarehouseStatus.AVAILABLE)
                .remarks(request.getRemarks())
                .build();

        return WarehouseInventoryResponse.fromEntity(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public WarehouseInventoryResponse updateInventory(Long id, WarehouseInventoryRequest request) {
        WarehouseInventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("找不到指定的庫存 ID: " + id));

        Material material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new BusinessException("找不到指定的材料 ID: " + request.getMaterialId()));

        inventory.setMaterial(material);
        inventory.setQuantity(request.getQuantity());
        inventory.setLocation(request.getLocation());
        if (request.getStatus() != null) {
            inventory.setStatus(request.getStatus());
        }
        inventory.setRemarks(request.getRemarks());

        return WarehouseInventoryResponse.fromEntity(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public void deleteInventory(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new BusinessException("找不到指定的庫存 ID: " + id);
        }
        inventoryRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventorySuggestionResponse> getSuggestions() {
        List<InventorySuggestionResponse> suggestions = new ArrayList<>();

        // 1. Get all AVAILABLE inventory
        List<WarehouseInventory> availableInventories = inventoryRepository.findByStatus(WarehouseStatus.AVAILABLE);

        for (WarehouseInventory inventory : availableInventories) {
            // 2. Find active needs for this material
            List<CaseMaterial> activeNeeds = caseMaterialRepository
                    .findActiveNeedsByMaterialId(inventory.getMaterial().getId());

            for (CaseMaterial need : activeNeeds) {
                // If inventory has some quantity, consider it a match
                if (inventory.getQuantity() > 0) {
                    suggestions.add(InventorySuggestionResponse.builder()
                            .inventoryId(inventory.getId())
                            .materialId(inventory.getMaterial().getId())
                            .materialName(inventory.getMaterial().getName())
                            .materialUnit(inventory.getMaterial().getUnit())
                            .remainQuantity(inventory.getQuantity())
                            .location(inventory.getLocation())
                            .projectId(need.getProject().getId())
                            .projectName(
                                    need.getProject().getClientName() + " (" + need.getProject().getProjectCode() + ")")
                            .projectAddress(need.getProject().getSiteAddress())
                            .projectQuantity(need.getQuantity())
                            .build());
                }
            }
        }
        return suggestions;
    }

    @Override
    @Transactional
    public void allocateToProject(Long inventoryId, Long projectId) {
        WarehouseInventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new BusinessException("找不到指定的庫存 ID: " + inventoryId));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException("找不到指定的專案 ID: " + projectId));

        if (inventory.getStatus() != WarehouseStatus.AVAILABLE) {
            throw new BusinessException("庫存非可用狀態，無法徵用");
        }

        int usedQuantity = inventory.getQuantity();

        // 2. 如果該案件已經有針對這個材料的「進貨」紀錄，先把數量扣掉
        caseMaterialRepository.findFirstByProject_IdAndMaterial_IdAndMaterialType(
                projectId,
                inventory.getMaterial().getId(),
                CaseMaterialType.PURCHASE).ifPresent(purchaseLine -> {
                    int newQty = purchaseLine.getQuantity() - usedQuantity;
                    if (newQty > 0) {
                        purchaseLine.setQuantity(newQty);
                        caseMaterialRepository.save(purchaseLine);
                    } else {
                        // 數量扣到 0，就刪掉這一列
                        caseMaterialRepository.delete(purchaseLine);
                    }
                });

        // 3. 新增一筆「剩料」來源的用料紀錄（LEFTOVER）
        CaseMaterial leftoverLine = CaseMaterial.builder()
                .project(project)
                .material(inventory.getMaterial())
                .quantity(usedQuantity)
                .materialType(CaseMaterialType.LEFTOVER)
                .unitPrice(null) // 若要記成本，可在此填入
                .lineCost(null)
                .build();

        caseMaterialRepository.save(leftoverLine);

        // 4. 更新庫存狀態 & 備註
        inventory.setStatus(WarehouseStatus.RESERVED);
        String allocationRemark = String.format(
                "徵用於案件: %s (%s)",
                project.getClientName(),
                project.getProjectCode());
        if (inventory.getRemarks() == null || inventory.getRemarks().isBlank()) {
            inventory.setRemarks(allocationRemark);
        } else {
            inventory.setRemarks(inventory.getRemarks() + " | " + allocationRemark);
        }

        inventoryRepository.save(inventory);
    }
}
