package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.common.exception.BusinessException;
import com.manage.interior_inventory.dto.worker.WorkerRequest;
import com.manage.interior_inventory.dto.worker.WorkerResponse;
import com.manage.interior_inventory.entity.Worker;
import com.manage.interior_inventory.repository.WorkerRepository;
import com.manage.interior_inventory.service.WorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkerServiceImpl implements WorkerService {

    private final WorkerRepository workerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WorkerResponse> getAllWorkers() {
        return workerRepository.findAll().stream()
                .map(WorkerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WorkerResponse createWorker(WorkerRequest request) {
        Worker worker = Worker.builder()
                .nickname(request.nickname())
                .dailyWage(request.dailyWage())
                .build();
        return WorkerResponse.fromEntity(workerRepository.save(worker));
    }

    @Override
    @Transactional
    public WorkerResponse updateWorker(Long id, WorkerRequest request) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Worker not found"));
        worker.setNickname(request.nickname());
        worker.setDailyWage(request.dailyWage());
        return WorkerResponse.fromEntity(workerRepository.save(worker));
    }

    @Override
    @Transactional
    public void deleteWorker(Long id) {
        if (!workerRepository.existsById(id)) {
            throw new BusinessException("Worker not found");
        }
        workerRepository.deleteById(id);
    }
}
