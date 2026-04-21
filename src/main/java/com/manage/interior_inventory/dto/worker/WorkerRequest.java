package com.manage.interior_inventory.dto.worker;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public record WorkerRequest(
                @NotBlank(message = "Nickname is required") String nickname,

                @NotNull(message = "Daily wage is required") @Min(value = 0, message = "Daily wage must be positive") Integer dailyWage) {
}
