package com.manage.interior_inventory.dto.quote;

import lombok.Builder;
import lombok.Value;

@Value
@Builder(toBuilder = true)
public class QuoteMaterialResponse {
    Long materialId;
    String materialName;
    int purchaseQuantity;
    int leftoverQuantity;
    int returnQuantity;
    int totalQuantity;
}
