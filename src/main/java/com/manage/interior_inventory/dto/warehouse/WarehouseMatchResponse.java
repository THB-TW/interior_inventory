package com.manage.interior_inventory.dto.warehouse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseMatchResponse {
    private Long warehouseId;
    private String materialName;
    private BigDecimal quantity;
    private String unit;
    private String location;
    private String note;
    private List<MatchedCaseDto> matchedCases;
}
