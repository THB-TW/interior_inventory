package com.manage.interior_inventory.dto.response;

import com.manage.interior_inventory.entity.CaseStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CaseDetailResponse {
    private Long id;
    private String caseCode;
    private String clientName;
    private String clientPhone;
    private String siteAddress;
    private CaseStatus status;
    private Long salesUserId;
    private Integer estimatedDays;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
