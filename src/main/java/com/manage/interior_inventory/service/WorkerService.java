package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.worker.WorkerRequest;
import com.manage.interior_inventory.dto.worker.WorkerResponse;
import java.util.List;

public interface WorkerService {
    List<WorkerResponse> getAllWorkers();
    WorkerResponse createWorker(WorkerRequest request);
    WorkerResponse updateWorker(Long id, WorkerRequest request);
    void deleteWorker(Long id);
}
