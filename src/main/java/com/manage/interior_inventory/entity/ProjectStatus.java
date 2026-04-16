package com.manage.interior_inventory.entity;

public enum ProjectStatus {
    INQUIRY("詢問中"),
    QUOTING("報價中"),
    CONFIRMED("已確認"),
    IN_PROGRESS("施工中"),
    INSPECTION("驗收中"),
    CLOSED("已結案"),
    CANCELLED("已取消");

    private final String description;

    ProjectStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
