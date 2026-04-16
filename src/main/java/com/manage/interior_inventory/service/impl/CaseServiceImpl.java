package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.dto.response.CaseDetailResponse;
import com.manage.interior_inventory.dto.response.CaseListItemResponse;
import com.manage.interior_inventory.entity.Case;
import com.manage.interior_inventory.entity.CaseStatus;
import com.manage.interior_inventory.repository.CaseRepository;
import com.manage.interior_inventory.service.CaseService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CaseServiceImpl implements CaseService {

    private final CaseRepository caseRepository;

    public CaseServiceImpl(CaseRepository caseRepository) {
        this.caseRepository = caseRepository;
    }

    @Override
    public List<CaseListItemResponse> getAllCases(CaseStatus status) {
        List<Case> cases;
        if (status != null) {
            cases = caseRepository.findByStatus(status);
        } else {
            cases = caseRepository.findAll();
        }
        // 不用stream的話早期是用for去抓比較不好檢查
        return cases.stream().map(this::mapToListItemResponse).collect(Collectors.toList());
    }

    @Override
    public CaseDetailResponse getCaseById(Long id) {
        Case caseEntity = caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found with id: " + id));
        return mapToDetailResponse(caseEntity);
    }

    private CaseListItemResponse mapToListItemResponse(Case caseEntity) {
        CaseListItemResponse dto = new CaseListItemResponse();
        dto.setId(caseEntity.getId());
        dto.setCaseCode(caseEntity.getCaseCode());
        dto.setClientName(caseEntity.getClientName());
        dto.setStatus(caseEntity.getStatus());
        dto.setCreatedAt(caseEntity.getCreatedAt());
        return dto;
    }

    private CaseDetailResponse mapToDetailResponse(Case caseEntity) {
        CaseDetailResponse dto = new CaseDetailResponse();
        dto.setId(caseEntity.getId());
        dto.setCaseCode(caseEntity.getCaseCode());
        dto.setClientName(caseEntity.getClientName());
        dto.setClientPhone(caseEntity.getClientPhone());
        dto.setSiteAddress(caseEntity.getSiteAddress());
        dto.setStatus(caseEntity.getStatus());
        dto.setSalesUserId(caseEntity.getSalesUserId());
        dto.setEstimatedDays(caseEntity.getEstimatedDays());
        dto.setCreatedAt(caseEntity.getCreatedAt());
        dto.setUpdatedAt(caseEntity.getUpdatedAt());
        return dto;
    }
}
