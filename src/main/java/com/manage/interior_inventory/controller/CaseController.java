package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.dto.response.CaseDetailResponse;
import com.manage.interior_inventory.dto.response.CaseListItemResponse;
import com.manage.interior_inventory.entity.CaseStatus;
import com.manage.interior_inventory.service.CaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping
    public ResponseEntity<List<CaseListItemResponse>> getAllCases(
            @RequestParam(required = false) CaseStatus status) {
        List<CaseListItemResponse> cases = caseService.getAllCases(status);
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseDetailResponse> getCaseById(@PathVariable Long id) {
        CaseDetailResponse caseDetail = caseService.getCaseById(id);
        return ResponseEntity.ok(caseDetail);
    }
}
