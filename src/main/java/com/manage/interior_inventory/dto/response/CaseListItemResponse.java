package com.manage.interior_inventory.dto.response;

import com.manage.interior_inventory.entity.CaseStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CaseListItemResponse {
    private Long id;
    private String caseCode;
    private String clientName;
    private CaseStatus status;
    private LocalDateTime createdAt;
}
