package com.manage.interior_inventory.dto.quote;

import com.manage.interior_inventory.entity.CaseMaterialType;
import lombok.Builder;
import lombok.Value;
import java.math.BigDecimal;

@Value
@Builder
public class QuoteMaterialLineResponse {
    Long caseMaterialId;
    Long materialId;
    String materialName;
    CaseMaterialType materialType;
    Integer quantity;
    BigDecimal unitPrice;
    BigDecimal lineCost;
}