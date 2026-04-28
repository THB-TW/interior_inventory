package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.bonus.BonusConfirmRequest;
import com.manage.interior_inventory.dto.bonus.BonusPreviewResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface WorkerBonusService {
    // 預覽獎金試算
    List<BonusPreviewResponse> previewBonus(LocalDate startDate, LocalDate endDate, BigDecimal dailyRate);

    // 確認並儲存獎金發放紀錄
    void confirmBonus(BonusConfirmRequest request);
}