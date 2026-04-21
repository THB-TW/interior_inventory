package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.material.MaterialResponse;
import com.manage.interior_inventory.dto.material.MaterialSaveRequest;

import java.util.List;

public interface MaterialService {
    List<MaterialResponse> getAllMaterials();

    MaterialResponse getMaterialById(Long id);

    MaterialResponse createMaterial(MaterialSaveRequest request);

    MaterialResponse updateMaterial(Long id, MaterialSaveRequest request);

    void deleteMaterial(Long id);
}