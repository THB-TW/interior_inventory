package com.manage.interior_inventory.dto.worker;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkerProjectSummary {
    private Long projectId;
    private String projectCode;
    private String clientName;
    private String address;
    private String status;
    private BigDecimal totalWorkdays; // 工作天數
    private BigDecimal totalWage; // 總工錢
    private BigDecimal totalTravel; // 總車馬費
    private BigDecimal totalWorkerCost; // 總工人支出 = totalWage + totalTravel
    private List<CaseWorkerResponse> workers;
}
