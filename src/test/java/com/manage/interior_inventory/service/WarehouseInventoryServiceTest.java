package com.manage.interior_inventory.service;

import com.manage.interior_inventory.common.exception.BusinessException;
import com.manage.interior_inventory.dto.warehouse.MatchedCaseDto;
import com.manage.interior_inventory.dto.warehouse.WarehouseMatchResponse;
import com.manage.interior_inventory.dto.warehouse.WarehouseReserveRequest;
import com.manage.interior_inventory.entity.Material;
import com.manage.interior_inventory.entity.WarehouseInventory;
import com.manage.interior_inventory.entity.WarehouseStatus;
import com.manage.interior_inventory.repository.MaterialRepository;
import com.manage.interior_inventory.repository.WarehouseInventoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WarehouseInventoryServiceTest {

    @Mock
    private WarehouseInventoryRepository inventoryRepository;

    @Mock
    private MaterialRepository materialRepository;

    @InjectMocks
    private WarehouseInventoryService service;

    @Test
    void testMatchAvailableInventoriesToCases_Success() {
        // Arrange
        Material material = Material.builder().id(1L).name("木材").unit("塊").build();
        WarehouseInventory inventory = WarehouseInventory.builder()
                .id(100L)
                .material(material)
                .quantity(BigDecimal.valueOf(10))
                .location("A1")
                .status(WarehouseStatus.AVAILABLE)
                .note("剩餘的木材")
                .build();

        MatchedCaseDto caseDto = new MatchedCaseDto(
                100L, 201L, "王大明", "台北市信義區", BigDecimal.valueOf(5), "塊"
        );

        when(inventoryRepository.findAllAvailableWithMaterials()).thenReturn(List.of(inventory));
        List<Object[]> rawCases = java.util.Collections.singletonList(new Object[]{100L, 201L, "王大明", "台北市信義區", 5, "塊"});
        when(inventoryRepository.findMatchedCasesForAvailableInventoryRaw()).thenReturn(rawCases);

        // Act
        List<WarehouseMatchResponse> result = service.matchAvailableInventoriesToCases();

        // Assert
        assertEquals(1, result.size());
        WarehouseMatchResponse match = result.get(0);
        assertEquals(100L, match.getWarehouseId());
        assertEquals("木材", match.getMaterialName());
        assertEquals(BigDecimal.valueOf(10), match.getQuantity());
        assertEquals("塊", match.getUnit());
        assertEquals("A1", match.getLocation());
        assertEquals("剩餘的木材", match.getNote());

        assertEquals(1, match.getMatchedCases().size());
        assertEquals(201L, match.getMatchedCases().get(0).getCaseId());
        assertEquals("王大明", match.getMatchedCases().get(0).getClientName());
    }

    @Test
    void testReserveInventory_Success() {
        // Arrange
        WarehouseInventory inventory = WarehouseInventory.builder()
                .id(100L)
                .status(WarehouseStatus.AVAILABLE)
                .note("原本的備註")
                .build();

        WarehouseReserveRequest request = new WarehouseReserveRequest();
        request.setCaseId(201L);
        request.setNote("預計使用2個");

        when(inventoryRepository.findById(100L)).thenReturn(Optional.of(inventory));

        // Act
        service.reserveInventory(100L, request);

        // Assert
        ArgumentCaptor<WarehouseInventory> captor = ArgumentCaptor.forClass(WarehouseInventory.class);
        verify(inventoryRepository).save(captor.capture());

        WarehouseInventory saved = captor.getValue();
        assertEquals(WarehouseStatus.RESERVED, saved.getStatus());
        assertTrue(saved.getNote().contains("原本的備註"));
        assertTrue(saved.getNote().contains("給案件 201 使用。備註: 預計使用2個"));
    }

    @Test
    void testReserveInventory_ThrowsWhenNotAvailable() {
        // Arrange
        WarehouseInventory inventory = WarehouseInventory.builder()
                .id(100L)
                .status(WarehouseStatus.USED)
                .build();

        WarehouseReserveRequest request = new WarehouseReserveRequest();

        when(inventoryRepository.findById(100L)).thenReturn(Optional.of(inventory));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            service.reserveInventory(100L, request);
        });

        assertTrue(exception.getMessage().contains("該剩料目前不可預約"));
    }
}
