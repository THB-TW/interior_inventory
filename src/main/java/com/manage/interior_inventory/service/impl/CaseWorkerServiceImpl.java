package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.dto.worker.CaseWorkerRequest;
import com.manage.interior_inventory.dto.worker.CaseWorkerResponse;
import com.manage.interior_inventory.dto.worker.WorkerProjectSummary;
import com.manage.interior_inventory.entity.CaseWorker;
import com.manage.interior_inventory.entity.Project;
import com.manage.interior_inventory.entity.ProjectStatus;
import com.manage.interior_inventory.entity.Worker;
import com.manage.interior_inventory.repository.CaseWorkerRepository;
import com.manage.interior_inventory.repository.ProjectRepository;
import com.manage.interior_inventory.repository.WorkerRepository;
import com.manage.interior_inventory.service.CaseWorkerService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CaseWorkerServiceImpl implements CaseWorkerService {

        private final CaseWorkerRepository caseWorkerRepository;
        private final ProjectRepository projectRepository;
        private final WorkerRepository workerRepository;

        @Override
        @Transactional(readOnly = true)
        public List<WorkerProjectSummary> getWorkerOverview() {
                List<ProjectStatus> allowedStatuses = List.of(
                                ProjectStatus.QUOTING,
                                ProjectStatus.CONFIRMED,
                                ProjectStatus.IN_PROGRESS,
                                ProjectStatus.INSPECTION,
                                ProjectStatus.CLOSED);

                List<Project> projects = projectRepository.findByStatusIn(allowedStatuses);

                return projects.stream()
                                .map(this::toSummary)
                                .toList();
        }

        private WorkerProjectSummary toSummary(Project project) {
                List<CaseWorker> rows = caseWorkerRepository.findByProjectId(project.getId());

                BigDecimal totalWage = rows.stream()
                                .map(CaseWorker::getDailyWage)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal totalTravel = rows.stream()
                                .map(CaseWorker::getTravelExpenses)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalWorkdays = rows.stream()
                                .map(cw -> cw.getDaysWorked() != null ? cw.getDaysWorked() : BigDecimal.ONE)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                return WorkerProjectSummary.builder()
                                .projectId(project.getId())
                                .projectCode(project.getProjectCode())
                                .clientName(project.getClientName())
                                .address(project.getSiteAddress())
                                .status(project.getStatus().name())
                                .totalWorkdays(totalWorkdays)
                                .totalWage(totalWage)
                                .totalTravel(totalTravel)
                                .totalWorkerCost(totalWage.add(totalTravel))
                                .workers(rows.stream().map(CaseWorkerResponse::fromEntity).toList())
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public List<CaseWorkerResponse> getCaseWorkers(Long caseId) {
                return caseWorkerRepository.findByProjectIdOrderByWorkdayAsc(caseId)
                                .stream()
                                .map(CaseWorkerResponse::fromEntity)
                                .toList();
        }

        @Override
        @Transactional
        public List<CaseWorkerResponse> createCaseWorker(Long caseId, CaseWorkerRequest request) {
                Project project = projectRepository.findById(caseId)
                                .orElseThrow(() -> new EntityNotFoundException("Project not found: " + caseId));

                Worker worker = resolveWorker(request.workerId());

                BigDecimal daysWorked = request.daysWorked() != null
                                ? request.daysWorked()
                                : BigDecimal.ONE;
                BigDecimal baseDailyWage = worker != null
                                ? BigDecimal.valueOf(worker.getDailyWage())
                                : request.dailyWage();
                BigDecimal actualDailyWage = baseDailyWage.multiply(daysWorked);

                LocalDate start = request.workday();
                LocalDate end = request.workdayEnd() != null ? request.workdayEnd() : start;

                if (end.isBefore(start)) {
                        throw new IllegalArgumentException("結束日期不能早於開始日期");
                }

                List<CaseWorker> entities = new ArrayList<>();
                for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
                        entities.add(CaseWorker.builder()
                                        .project(project)
                                        .worker(worker)
                                        .dailyWage(actualDailyWage)
                                        .daysWorked(daysWorked)
                                        .workday(date)
                                        .travelExpenses(request.travelExpenses())
                                        .build());
                }

                return caseWorkerRepository.saveAll(entities)
                                .stream()
                                .map(CaseWorkerResponse::fromEntity)
                                .toList();
        }

        @Override
        @Transactional
        public CaseWorkerResponse updateCaseWorker(Long caseWorkerId, CaseWorkerRequest request) {
                CaseWorker entity = caseWorkerRepository.findById(caseWorkerId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "CaseWorker not found: " + caseWorkerId));

                Worker worker = resolveWorker(request.workerId());

                BigDecimal daysWorked = request.daysWorked() != null
                                ? request.daysWorked()
                                : BigDecimal.ONE;

                BigDecimal baseDailyWage = worker != null
                                ? BigDecimal.valueOf(worker.getDailyWage())
                                : request.dailyWage();

                BigDecimal actualWage = baseDailyWage.multiply(daysWorked);

                entity.setWorker(worker);
                entity.setDailyWage(actualWage);
                entity.setDaysWorked(daysWorked);
                entity.setWorkday(request.workday());
                entity.setTravelExpenses(request.travelExpenses());

                return CaseWorkerResponse.fromEntity(caseWorkerRepository.save(entity));
        }

        @Override
        @Transactional
        public void deleteCaseWorker(Long caseWorkerId) {
                if (!caseWorkerRepository.existsById(caseWorkerId)) {
                        throw new EntityNotFoundException("CaseWorker not found: " + caseWorkerId);
                }
                caseWorkerRepository.deleteById(caseWorkerId);
        }

        /**
         * workerId 不為 null → 去 workers 表找，找不到就拋錯。
         * workerId 為 null → 允許，worker 欄位存 null。
         */
        private Worker resolveWorker(Long workerId) {
                if (workerId == null)
                        return null;
                return workerRepository.findById(workerId)
                                .orElseThrow(() -> new EntityNotFoundException("Worker not found: " + workerId));
        }
}