package com.manage.interior_inventory.dto.quote;

import java.math.BigDecimal;

import com.manage.interior_inventory.entity.CaseMaterialType;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class QuoteMaterialRequset {
    Long materialId; // 使用者從下拉選單選的 material
    CaseMaterialType materialType;
    Integer quantity;
    BigDecimal unitPrice;
}
