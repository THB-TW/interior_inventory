package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.finance.ProjectProfitDTO;
import com.manage.interior_inventory.dto.quote.QuoteMaterialResponse;
import com.manage.interior_inventory.dto.quote.QuoteUsageResponse;
import com.manage.interior_inventory.dto.worker.WorkerProjectSummary;
import com.manage.interior_inventory.entity.Project;
import com.manage.interior_inventory.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final ProjectRepository projectRepository;
    private final QuoteUsageService quoteUsageService;
    private final CaseWorkerService caseWorkerService;

    public List<ProjectProfitDTO> getAllProjectProfits() {
        // 一次拉全部，避免 N+1
        Map<Long, BigDecimal> materialCostMap = quoteUsageService.getQuoteUsageOverview()
                .stream()
                .collect(Collectors.toMap(
                        QuoteUsageResponse::getProjectId,
                        r -> r.getMaterials().stream()
                                .map(QuoteMaterialResponse::getLineCost)
                                .filter(Objects::nonNull)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)));

        Map<Long, WorkerProjectSummary> workerMap = caseWorkerService.getWorkerOverview()
                .stream()
                .collect(Collectors.toMap(WorkerProjectSummary::getProjectId, s -> s));

        return projectRepository.findAll().stream()
                .map(p -> toDTO(
                        p,
                        materialCostMap.getOrDefault(p.getId(), BigDecimal.ZERO),
                        workerMap.get(p.getId())))
                .toList();
    }

    public ProjectProfitDTO getProjectProfit(Long projectId) {
        Project p = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "案件不存在"));

        BigDecimal materialCost = quoteUsageService.getProjectQuoteUsage(projectId)
                .stream()
                .flatMap(r -> r.getMaterials().stream())
                .map(QuoteMaterialResponse::getLineCost)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        WorkerProjectSummary workerSummary = caseWorkerService.getWorkerOverview()
                .stream()
                .filter(s -> s.getProjectId().equals(projectId))
                .findFirst()
                .orElse(null);

        return toDTO(p, materialCost, workerSummary);
    }

    private ProjectProfitDTO toDTO(Project p, BigDecimal materialCost,
            WorkerProjectSummary workerSummary) {
        BigDecimal workerCost = workerSummary != null ? workerSummary.getTotalWage() : BigDecimal.ZERO;
        BigDecimal travelCost = workerSummary != null ? workerSummary.getTotalTravel() : BigDecimal.ZERO;
        BigDecimal mealCost = workerSummary != null ? workerSummary.getTotalMeal() : BigDecimal.ZERO;
        BigDecimal contract = p.getContractAmount() != null ? p.getContractAmount() : BigDecimal.ZERO;
        BigDecimal profit = contract.subtract(materialCost).subtract(workerCost).subtract(travelCost).subtract(mealCost);

        Double profitRate = p.getContractAmount() != null
                && p.getContractAmount().compareTo(BigDecimal.ZERO) > 0
                        ? profit.divide(p.getContractAmount(), 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100)).doubleValue()
                        : null;

        return new ProjectProfitDTO(
                p.getId(), p.getProjectCode(), p.getClientName(), p.getStatus().name(),
                p.getContractAmount(), p.getReceivedAmount(), p.getPaymentStatus(),
                materialCost, workerCost, travelCost, mealCost, profit, profitRate);
    }
}