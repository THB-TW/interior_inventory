package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.common.exception.BusinessException;
import com.manage.interior_inventory.dto.bonus.BonusConfirmRequest;
import com.manage.interior_inventory.dto.bonus.BonusPreviewResponse;
import com.manage.interior_inventory.entity.Worker;
import com.manage.interior_inventory.entity.WorkerBonusItem;
import com.manage.interior_inventory.entity.WorkerBonusPeriod;
import com.manage.interior_inventory.repository.CaseWorkerRepository;
import com.manage.interior_inventory.repository.WorkerBonusPeriodRepository;
import com.manage.interior_inventory.repository.WorkerRepository;
import com.manage.interior_inventory.service.WorkerBonusService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkerBonusServiceImpl implements WorkerBonusService {

    private final CaseWorkerRepository caseWorkerRepository;
    private final WorkerBonusPeriodRepository bonusPeriodRepository;
    private final WorkerRepository workerRepository;

    @Override
    public List<BonusPreviewResponse> previewBonus(LocalDate startDate, LocalDate endDate, BigDecimal dailyRate) {
        // 1. 確保日期合理
        if (startDate.isAfter(endDate)) {
            throw new BusinessException("起始日期不能晚於結束日期");
        }

        // 2. 撈取 GROUP BY 後的資料 (Object[] 格式：0=workerId, 1=nickname, 2=sum(daysWorked))
        List<Object[]> rawData = caseWorkerRepository.sumDaysWorkedByWorkerGrouped(startDate, endDate);

        // 3. 轉換成前端需要的 DTO
        return rawData.stream().map(row -> {
            Long workerId = (Long) row[0];
            String workerName = (String) row[1];
            BigDecimal totalDays = (BigDecimal) row[2];

            // 系統試算：總天數 * 每日基準 (使用 BigDecimal 的 multiply 方法，精準無誤差！)
            BigDecimal calculatedAmount = totalDays.multiply(dailyRate);

            return new BonusPreviewResponse(workerId, workerName, totalDays, calculatedAmount);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional // 確保主檔跟明細檔要嘛一起成功，要嘛一起失敗回滾
    public void confirmBonus(BonusConfirmRequest request) {
        // 1. 建立主檔 Entity
        WorkerBonusPeriod period = WorkerBonusPeriod.builder()
                .periodStart(request.startDate())
                .periodEnd(request.endDate())
                .label(request.label())
                .dailyRate(request.dailyRate())
                .build();

        // 2. 建立並綁定明細檔
        request.items().forEach(itemDto -> {
            // 確認師傅是否存在
            Worker worker = workerRepository.findById(itemDto.workerId())
                    .orElseThrow(() -> new BusinessException("找不到師傅 ID: " + itemDto.workerId()));

            WorkerBonusItem item = WorkerBonusItem.builder()
                    .worker(worker)
                    .totalDays(itemDto.totalDays())
                    .calculatedAmount(itemDto.calculatedAmount())
                    .actualAmount(itemDto.actualAmount()) // 老闆微調後的最終金額
                    .build();

            // 使用 Entity 內建的輔助方法雙向綁定 (這會把 item 塞入 period 的 items 陣列中)
            period.addItem(item);
        });

        // 3. 儲存進資料庫 (因為設定了 cascade = CascadeType.ALL，存主檔就會連明細一起存)
        bonusPeriodRepository.save(period);
    }
}