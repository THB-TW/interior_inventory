package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.common.exception.BusinessException;
import com.manage.interior_inventory.dto.project.ProjectEstimationResponse;
import com.manage.interior_inventory.dto.project.ProjectEstimationSaveRequest;
import com.manage.interior_inventory.entity.EstimationItem;
import com.manage.interior_inventory.entity.EstimationWorkerItem;
import com.manage.interior_inventory.entity.ProjectEstimation;
import com.manage.interior_inventory.entity.Worker;
import com.manage.interior_inventory.repository.ProjectEstimationRepository;
import com.manage.interior_inventory.repository.ProjectRepository;
import com.manage.interior_inventory.repository.WorkerRepository;
import com.manage.interior_inventory.service.ProjectEstimationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectEstimationServiceImpl implements ProjectEstimationService {

    private final ProjectEstimationRepository estimationRepository;
    private final ProjectRepository projectRepository;
    private final WorkerRepository workerRepository;

    @Override
    @Transactional(readOnly = true)
    public ProjectEstimationResponse getEstimationByProjectId(Long projectId) {
        ProjectEstimation estimation = estimationRepository.findByProjectId(projectId)
                .orElse(null);
        if (estimation == null) return null;
        return ProjectEstimationResponse.fromEntity(estimation);
    }

    @Override
    @Transactional
    public ProjectEstimationResponse saveEstimation(Long projectId, ProjectEstimationSaveRequest request) {
        if (!projectRepository.existsById(projectId)) {
            throw new BusinessException("Project not found");
        }

        ProjectEstimation estimation = estimationRepository.findByProjectId(projectId)
                .orElseGet(() -> ProjectEstimation.builder()
                        .projectId(projectId)
                        .build());

        // Clear existing items to overwrite (orphanRemoval will delete them)
        if (estimation.getItems() != null) {
            estimation.getItems().clear();
        }
        if (estimation.getWorkerItems() != null) {
            estimation.getWorkerItems().clear();
        }

        int totalMaterials = 0;
        if (request.items() != null) {
            for (var itemReq : request.items()) {
                int sub = itemReq.quantity() * itemReq.unitPrice();
                totalMaterials += sub;
                EstimationItem item = EstimationItem.builder()
                        .estimation(estimation)
                        .materialName(itemReq.materialName())
                        .quantity(itemReq.quantity())
                        .unitPrice(itemReq.unitPrice())
                        .subtotal(sub)
                        .build();
                estimation.getItems().add(item);
            }
        }

        int laborCost = 0;
        if (request.workerItems() != null) {
            for (var workerReq : request.workerItems()) {
                Worker worker = workerRepository.findById(workerReq.workerId())
                        .orElseThrow(() -> new BusinessException("Worker not found: " + workerReq.workerId()));
                
                int sub = workerReq.days().multiply(new BigDecimal(worker.getDailyWage())).intValue();
                laborCost += sub;

                EstimationWorkerItem wItem = EstimationWorkerItem.builder()
                        .estimation(estimation)
                        .workerId(workerReq.workerId())
                        .days(workerReq.days())
                        .subtotal(sub)
                        .build();
                estimation.getWorkerItems().add(wItem);
            }
        }

        estimation.setLaborCost(laborCost);
        estimation.setProfit(request.profit());
        estimation.setTotalAmount(totalMaterials + laborCost + request.profit());

        ProjectEstimation saved = estimationRepository.save(estimation);
        return ProjectEstimationResponse.fromEntity(saved);
    }
}
