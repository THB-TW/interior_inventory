package com.manage.interior_inventory.dto.quote;

import com.manage.interior_inventory.entity.ProjectStatus;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class QuoteUsageResponse {
    Long projectId;
    String projectCode;
    ProjectStatus status;
    String clientName;
    String address;
    String description;
    List<QuoteMaterialResponse> materials;
}
