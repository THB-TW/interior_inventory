package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.response.CaseDetailResponse;
import com.manage.interior_inventory.dto.response.CaseListItemResponse;
import com.manage.interior_inventory.entity.CaseStatus;

import java.util.List;

public interface CaseService {
    List<CaseListItemResponse> getAllCases(CaseStatus status);
    CaseDetailResponse getCaseById(Long id);
}
