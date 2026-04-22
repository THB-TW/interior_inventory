package com.manage.interior_inventory.service;

import java.util.List;
import com.manage.interior_inventory.dto.worker.CaseWorkerRequest;
import com.manage.interior_inventory.dto.worker.CaseWorkerResponse;
import com.manage.interior_inventory.dto.worker.WorkerProjectSummary;

public interface CaseWorkerService {

    List<WorkerProjectSummary> getWorkerOverview();

    List<CaseWorkerResponse> getCaseWorkers(Long caseId);

    CaseWorkerResponse createCaseWorker(Long caseId, CaseWorkerRequest request);

    CaseWorkerResponse updateCaseWorker(Long caseWorkerId, CaseWorkerRequest request);

    void deleteCaseWorker(Long caseWorkerId);
}