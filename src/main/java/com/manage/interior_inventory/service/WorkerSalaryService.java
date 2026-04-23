package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.salary.*;
import com.manage.interior_inventory.entity.WorkerSalaryItem;
import com.manage.interior_inventory.entity.WorkerSalaryPeriod;
import com.manage.interior_inventory.entity.enums.SalaryStatus;
import com.manage.interior_inventory.repository.WorkerSalaryItemRepository;
import com.manage.interior_inventory.repository.WorkerSalaryPeriodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkerSalaryService {

    private final WorkerSalaryPeriodRepository periodRepo;
    private final WorkerSalaryItemRepository itemRepo;

    // ────────────────────────────────────────
    // Period CRUD
    // ────────────────────────────────────────

    /** 查所有期別（不帶明細） */
    @Transactional(readOnly = true)
    public List<SalaryPeriodResponse> getAllPeriods() {
        return periodRepo.findAllByOrderByPeriodStartDesc()
                .stream()
                .map(p -> toPeriodResponse(p, false))
                .toList();
    }

    /** 查單一期別（帶師傅彙總） */
    @Transactional(readOnly = true)
    public SalaryPeriodResponse getPeriodById(Long periodId) {
        WorkerSalaryPeriod period = findPeriodOrThrow(periodId);
        return toPeriodResponse(period, true);
    }

    /** 建立新期別 */
    @Transactional
    public SalaryPeriodResponse createPeriod(SalaryPeriodCreateRequest req) {
        // 防重複
        periodRepo.findByPeriodStartAndPeriodEnd(req.periodStart(), req.periodEnd())
                .ifPresent(p -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "此期別區間已存在：" + p.getLabel());
                });

        WorkerSalaryPeriod period = WorkerSalaryPeriod.builder()
                .periodStart(req.periodStart())
                .periodEnd(req.periodEnd())
                .label(req.label())
                .status(SalaryStatus.PENDING)
                .build();

        periodRepo.save(period);
        return toPeriodResponse(period, false);
    }

    /** PENDING → CONFIRMED */
    @Transactional
    public SalaryPeriodResponse confirmPeriod(Long periodId) {
        WorkerSalaryPeriod period = findPeriodOrThrow(periodId);

        if (!SalaryStatus.PENDING.equals(period.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "只有 PENDING 狀態可以確認，目前狀態：" + period.getStatus());
        }

        period.setStatus(SalaryStatus.CONFIRMED);
        periodRepo.save(period);
        return toPeriodResponse(period, false);
    }

    /** CONFIRMED → PAID（全部 item 標記已付） */
    @Transactional
    public SalaryPeriodResponse markPeriodPaid(Long periodId) {
        WorkerSalaryPeriod period = findPeriodOrThrow(periodId);

        if (!SalaryStatus.CONFIRMED.equals(period.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "只有 CONFIRMED 狀態可以標記付款，目前狀態：" + period.getStatus());
        }

        List<WorkerSalaryItem> unpaidItems = itemRepo.findByPeriodIdAndIsPaidFalse(periodId);
        LocalDateTime now = LocalDateTime.now();
        unpaidItems.forEach(item -> {
            item.setIsPaid(true);
            item.setPaidAt(now);
        });
        itemRepo.saveAll(unpaidItems);

        period.setStatus(SalaryStatus.PAID);
        periodRepo.save(period);
        return toPeriodResponse(period, false);
    }

    // ────────────────────────────────────────
    // Item 操作
    // ────────────────────────────────────────

    /** 查某期別所有明細 */
    @Transactional(readOnly = true)
    public List<SalaryItemDetail> getItemsByPeriod(Long periodId) {
        findPeriodOrThrow(periodId);
        return itemRepo.findByPeriodId(periodId)
                .stream()
                .map(this::toItemDetail)
                .toList();
    }

    /** 查某師傅的薪資歷史 */
    @Transactional(readOnly = true)
    public List<SalaryItemDetail> getItemsByWorker(Long workerId) {
        return itemRepo.findByWorkerIdOrderByCreatedAtDesc(workerId)
                .stream()
                .map(this::toItemDetail)
                .toList();
    }

    /** 手動調整金額 */
    @Transactional
    public SalaryItemDetail adjustItem(Long itemId, SalaryItemAdjustRequest req) {
        WorkerSalaryItem item = findItemOrThrow(itemId);

        // 已付款不可調整
        if (Boolean.TRUE.equals(item.getIsPaid())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "已付款的項目不可調整");
        }

        // PAID 狀態的期別不可調整
        if (item.getPeriod() != null &&
                SalaryStatus.PAID.equals(item.getPeriod().getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "已結算期別不可調整");
        }

        item.setAdjustment(req.adjustment());
        item.setFinalAmount(
                item.getBaseAmount()
                        .add(item.getTravelExpenses())
                        .add(req.adjustment()));
        if (req.note() != null)
            item.setNote(req.note());

        itemRepo.save(item);
        return toItemDetail(item);
    }

    /** 單筆標記付款 */
    @Transactional
    public SalaryItemDetail markItemPaid(Long itemId) {
        WorkerSalaryItem item = findItemOrThrow(itemId);

        if (Boolean.TRUE.equals(item.getIsPaid())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "此項目已標記付款");
        }

        item.setIsPaid(true);
        item.setPaidAt(LocalDateTime.now());
        itemRepo.save(item);
        return toItemDetail(item);
    }

    // ────────────────────────────────────────
    // Private helpers
    // ────────────────────────────────────────

    private WorkerSalaryPeriod findPeriodOrThrow(Long periodId) {
        return periodRepo.findById(periodId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "找不到薪資期別 id=" + periodId));
    }

    private WorkerSalaryItem findItemOrThrow(Long itemId) {
        return itemRepo.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "找不到薪資明細 id=" + itemId));
    }

    private SalaryPeriodResponse toPeriodResponse(WorkerSalaryPeriod p, boolean withWorkers) {
        BigDecimal total = periodRepo.findById(p.getId())
                .map(pp -> itemRepo.sumFinalAmountByPeriodId(pp.getId()))
                .orElse(BigDecimal.ZERO);

        BigDecimal paid = itemRepo.findByPeriodId(p.getId()).stream()
                .filter(i -> Boolean.TRUE.equals(i.getIsPaid()))
                .map(WorkerSalaryItem::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<WorkerSalarySummary> workers = withWorkers
                ? buildWorkerSummaries(p.getId())
                : null;

        return new SalaryPeriodResponse(
                p.getId(),
                p.getPeriodStart(),
                p.getPeriodEnd(),
                p.getLabel(),
                p.getStatus(),
                total,
                paid,
                total.subtract(paid),
                p.getCreatedAt(),
                workers);
    }

    private List<WorkerSalarySummary> buildWorkerSummaries(Long periodId) {
        // 用 JPQL 彙總結果轉換
        return itemRepo.findWorkerSummaryByPeriodId(periodId).stream()
                .map(row -> new WorkerSalarySummary(
                        ((Number) row[0]).longValue(), // workerId
                        (String) row[1], // nickname
                        (String) row[2], // wageType
                        (BigDecimal) row[3], // total
                        (BigDecimal) row[4], // paidTotal
                        (BigDecimal) row[5], // unpaidTotal
                        ((BigDecimal) row[5]).compareTo(BigDecimal.ZERO) == 0, // allPaid
                        null // items 不展開
                ))
                .toList();
    }

    private SalaryItemDetail toItemDetail(WorkerSalaryItem i) {
        return new SalaryItemDetail(
                i.getId(),
                i.getPeriod() != null ? i.getPeriod().getId() : null,
                i.getWorker().getId(),
                i.getWorker().getNickname(),
                i.getProject() != null ? i.getProject().getId() : null,
                i.getProject() != null ? i.getProject().getProjectCode() : null,
                i.getWageType(),
                i.getBaseAmount(),
                i.getTravelExpenses(),
                i.getAdjustment(),
                i.getFinalAmount(),
                Boolean.TRUE.equals(i.getIsPaid()),
                i.getPaidAt(),
                i.getNote(),
                i.getCreatedAt());
    }
}