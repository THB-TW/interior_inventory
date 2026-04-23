package com.manage.interior_inventory.dto.worker;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CaseWorkerRequest(

                Long workerId,

                @NotNull(message = "請輸入工資") @DecimalMin(value = "0", message = "請輸入正確工資") BigDecimal dailyWage,

                @NotNull(message = "請選擇工期") LocalDate workday,

                LocalDate workdayEnd,

                @NotNull(message = "請輸入車馬費") @DecimalMin(value = "0", message = "請輸入正確車馬費") BigDecimal travelExpenses) {
}