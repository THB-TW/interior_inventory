package com.manage.interior_inventory.dto.warehouse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchedCaseDto {
    private Long warehouseId; // Used internally for grouping, will not be shown in final JSON directly inside the element but useful for query projection
    private Long caseId;
    private String clientName;
    private String fullAddress;
    private BigDecimal materialNeeded;
    private String unit;
}
