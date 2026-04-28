package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.common.exception.BusinessException;
import com.manage.interior_inventory.dto.material.MaterialResponse;
import com.manage.interior_inventory.dto.material.MaterialSaveRequest;
import com.manage.interior_inventory.entity.Material;
import com.manage.interior_inventory.repository.MaterialRepository;
import com.manage.interior_inventory.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MaterialResponse> getAllMaterials() {
        return materialRepository.findAll()
                .stream()
                .map(MaterialResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MaterialResponse getMaterialById(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new BusinessException("找不到材料 ID: " + id));
        return MaterialResponse.fromEntity(material);
    }

    @Override
    @Transactional
    public MaterialResponse createMaterial(MaterialSaveRequest request) {
        if (materialRepository.existsByName(request.getName())) {
            throw new BusinessException("材料名稱已存在：" + request.getName());
        }

        Material material = Material.builder()
                .name(request.getName())
                .unit(request.getUnit())
                .description(request.getDescription())
                .defaultPrice(request.getDefaultPrice())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Material saved = materialRepository.save(material);
        return MaterialResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public MaterialResponse updateMaterial(Long id, MaterialSaveRequest request) {
        if (materialRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BusinessException("材料名稱已存在：" + request.getName());
        }

        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new BusinessException("找不到材料 ID: " + id));

        material.setName(request.getName());
        material.setUnit(request.getUnit());
        material.setDescription(request.getDescription());
        material.setDefaultPrice(request.getDefaultPrice());
        if (request.getIsActive() != null) {
            material.setIsActive(request.getIsActive());
        }

        Material updated = materialRepository.save(material);
        return MaterialResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteMaterial(Long id) {
        if (!materialRepository.existsById(id)) {
            throw new BusinessException("要刪除的材料不存在，ID: " + id);
        }
        materialRepository.deleteById(id);
    }
}