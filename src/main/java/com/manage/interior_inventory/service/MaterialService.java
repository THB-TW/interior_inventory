package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.material.MaterialResponse;
import java.util.List;

public interface MaterialService {
    List<MaterialResponse> getAllMaterials();
}