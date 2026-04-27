package com.manage.interior_inventory.dto.worker;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CaseWorkerRequest(

                Long workerId,

                @NotNull(message = "請輸入工資") @DecimalMin(value = "0", message = "請輸入正確工資") BigDecimal dailyWage,

                @NotNull(message = "請選擇工期") LocalDate workday,
                @DecimalMin(value = "0.1", inclusive = true, message = "工時必須大於 0") BigDecimal daysWorked,
                LocalDate workdayEnd,

                @NotNull(message = "請輸入車馬費") @DecimalMin(value = "0", message = "請輸入正確車馬費") BigDecimal travelExpenses,
                @NotNull(message = "請輸入餐費") @DecimalMin(value = "0", message = "請輸入正確餐費") BigDecimal mealAllowance) {
}