package com.manage.interior_inventory.entity.enums;

public enum InvoiceItemMatchStatus {
    OK, // 核對成功
    NOT_FOUND_IN_SYS, // PDF 有但系統無此材料
    NOT_FOUND_IN_PDF, // PDF 沒有但系統有此材料
    QTY_MISMATCH, // 數量不對
    PRICE_MISMATCH, // 單價不對
    RETURNED, // 退貨
    BATCH_NOT_FOUND_IN_SYS // 材料名稱找到了，但系統沒有這一批次的叫貨
}