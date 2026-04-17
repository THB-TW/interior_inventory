package com.manage.interior_inventory.entity;

public enum InquiryStatus {
    PENDING("待處理"),
    PROCESSING("處理中"),
    CLOSED("已結案");

    private final String description;

    InquiryStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
