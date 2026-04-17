package com.manage.interior_inventory.dto.worker;

import com.manage.interior_inventory.entity.Worker;

public record WorkerResponse(
        Long id,
        String nickname,
        Integer dailyWage
) {
    public static WorkerResponse fromEntity(Worker worker) {
        return new WorkerResponse(
                worker.getId(),
                worker.getNickname(),
                worker.getDailyWage()
        );
    }
}
