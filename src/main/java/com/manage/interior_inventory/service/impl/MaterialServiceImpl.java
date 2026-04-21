package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.dto.material.MaterialResponse;
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
}
