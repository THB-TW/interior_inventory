package com.manage.interior_inventory.entity;

public enum WarehouseStatus {
    AVAILABLE("可用"),
    RESERVED("已被案件標記使用中"),
    STORAGE("儲存中");

    private final String description;

    WarehouseStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
