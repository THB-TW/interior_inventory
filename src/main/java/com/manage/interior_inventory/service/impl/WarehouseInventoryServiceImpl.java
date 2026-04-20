package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.dto.inventory.WarehouseInventoryResponse;
import com.manage.interior_inventory.repository.WarehouseInventoryRepository;
import com.manage.interior_inventory.service.WarehouseInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseInventoryServiceImpl implements WarehouseInventoryService {

    private final WarehouseInventoryRepository inventoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseInventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(WarehouseInventoryResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
