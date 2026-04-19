package com.manage.interior_inventory.service;

import com.manage.interior_inventory.common.exception.BusinessException;
import com.manage.interior_inventory.dto.warehouse.*;
import com.manage.interior_inventory.entity.Material;
import com.manage.interior_inventory.entity.WarehouseInventory;
import com.manage.interior_inventory.entity.WarehouseStatus;
import com.manage.interior_inventory.repository.MaterialRepository;
import com.manage.interior_inventory.repository.WarehouseInventoryRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseInventoryService {

    private final WarehouseInventoryRepository inventoryRepository;
    private final MaterialRepository materialRepository;

    @Transactional(readOnly = true)
    public Page<WarehouseInventoryResponse> getInventories(String keyword, WarehouseStatus status, Pageable pageable) {
        Specification<WarehouseInventory> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                Join<WarehouseInventory, Material> materialJoin = root.join("material");
                predicates.add(cb.like(cb.lower(materialJoin.get("name")), "%" + keyword.toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new Predicate[0]));
        };

        return inventoryRepository.findAll(spec, pageable).map(WarehouseInventoryResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public WarehouseInventoryResponse getInventoryById(Long id) {
        WarehouseInventory inventory = getInventoryEntityOrThrow(id);
        return WarehouseInventoryResponse.fromEntity(inventory);
    }

    @Transactional
    public WarehouseInventoryResponse createInventory(WarehouseInventoryRequest request) {
        Material material = getMaterialEntityOrThrow(request.getMaterialId());

        WarehouseInventory inventory = WarehouseInventory.builder()
                .material(material)
                .quantity(request.getQuantity())
                .location(request.getLocation())
                .status(request.getStatus() != null ? request.getStatus() : WarehouseStatus.AVAILABLE)
                .note(request.getNote())
                .build();

        return WarehouseInventoryResponse.fromEntity(inventoryRepository.save(inventory));
    }

    @Transactional
    public WarehouseInventoryResponse updateInventory(Long id, WarehouseInventoryRequest request) {
        WarehouseInventory inventory = getInventoryEntityOrThrow(id);
        Material material = getMaterialEntityOrThrow(request.getMaterialId());

        inventory.setMaterial(material);
        inventory.setQuantity(request.getQuantity());
        inventory.setLocation(request.getLocation());
        if (request.getStatus() != null) {
            inventory.setStatus(request.getStatus());
        }
        inventory.setNote(request.getNote());

        return WarehouseInventoryResponse.fromEntity(inventoryRepository.save(inventory));
    }

    @Transactional
    public void deleteInventory(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new BusinessException("查無該倉庫資料，ID: " + id);
        }
        inventoryRepository.deleteById(id);
    }

    @Transactional
    public WarehouseInventoryResponse updateInventoryStatus(Long id, WarehouseStatusUpdateRequest request) {
        WarehouseInventory inventory = getInventoryEntityOrThrow(id);
        inventory.setStatus(request.getStatus());
        if (request.getNote() != null) {
            inventory.setNote(request.getNote());
        }
        return WarehouseInventoryResponse.fromEntity(inventoryRepository.save(inventory));
    }

    @Transactional
    public void reserveInventory(Long warehouseId, WarehouseReserveRequest request) {
        WarehouseInventory inventory = getInventoryEntityOrThrow(warehouseId);

        if (inventory.getStatus() != WarehouseStatus.AVAILABLE) {
            throw new BusinessException("該剩料目前不可預約，狀態為: " + inventory.getStatus().getDescription());
        }

        inventory.setStatus(WarehouseStatus.RESERVED);

        String newNote = String.format("給案件 %d 使用。備註: %s", request.getCaseId(), request.getNote() != null ? request.getNote() : "");
        if (StringUtils.hasText(inventory.getNote())) {
            inventory.setNote(inventory.getNote() + "\n" + newNote);
        } else {
            inventory.setNote(newNote);
        }

        inventoryRepository.save(inventory);
    }

    @Transactional(readOnly = true)
    public List<WarehouseMatchResponse> matchAvailableInventoriesToCases() {
        // 1. Get all available inventories
        List<WarehouseInventory> availableInventories = inventoryRepository.findAllAvailableWithMaterials();

        // 2. Get all matched cases (where case material name matches available inventory material name)
        // using the repository custom query which joins via material_id
        List<Object[]> rawCases = inventoryRepository.findMatchedCasesForAvailableInventoryRaw();
        List<MatchedCaseDto> allMatchedCases = rawCases.stream().map(row -> new MatchedCaseDto(
                ((Number) row[0]).longValue(),
                ((Number) row[1]).longValue(),
                (String) row[2],
                (String) row[3],
                new java.math.BigDecimal(row[4].toString()),
                (String) row[5]
        )).collect(Collectors.toList());

        // 3. Group cases by warehouseId
        Map<Long, List<MatchedCaseDto>> groupedCases = allMatchedCases.stream()
                .collect(Collectors.groupingBy(MatchedCaseDto::getWarehouseId));

        // 4. Map them back to the response format
        return availableInventories.stream()
                .filter(inv -> groupedCases.containsKey(inv.getId()))
                .map(inv -> WarehouseMatchResponse.builder()
                        .warehouseId(inv.getId())
                        .materialName(inv.getMaterial().getName())
                        .quantity(inv.getQuantity())
                        .unit(inv.getMaterial().getUnit())
                        .location(inv.getLocation())
                        .note(inv.getNote())
                        .matchedCases(groupedCases.getOrDefault(inv.getId(), new ArrayList<>()))
                        .build())
                .collect(Collectors.toList());
    }

    private WarehouseInventory getInventoryEntityOrThrow(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("找不到該倉庫資料，ID: " + id));
    }

    private Material getMaterialEntityOrThrow(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new BusinessException("找不到該料件資料，ID: " + id));
    }
}
