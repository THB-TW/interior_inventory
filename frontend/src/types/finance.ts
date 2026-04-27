export interface ProjectProfitDTO {
    projectId: number;
    projectCode: string;
    clientName: string;
    status: string;
    contractAmount: number | null;
    receivedAmount: number | null;
    paymentStatus: string | null;
    materialCost: number;
    workerCost: number;
    travelCost: number;
    mealCost: number;
    profit: number;
    profitRate: number | null;
}

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'COMPLETED';

// ── 對帳單比對狀態 ────────────────────────────────────────────────
export type InvoiceItemMatchStatus =
    | 'OK'
    | 'NOT_FOUND_IN_SYS'   // PDF 有，系統無此材料
    | 'NOT_FOUND_IN_PDF'   // PDF 無，系統有此材料（虛擬補充行）
    | 'QTY_MISMATCH'       // 數量不對
    | 'PRICE_MISMATCH'    // 單價不對
    | 'BATCH_NOT_FOUND_IN_SYS'  // 批次未叫貨
    | 'RETURNED';          // 退貨

// ── 明細單筆 ──────────────────────────────────────────────────────
export interface InvoiceItemDto {
    itemId: number;
    materialNameRaw: string;       // PDF 原始材料名稱
    unit: string;
    quantity: number | null;       // NOT_FOUND_IN_PDF 為 0
    unitPrice: number | null;
    totalPrice: number | null;
    materialId: number | null;     // 比對不到時為 null
    matchStatus: InvoiceItemMatchStatus;
}

// ── 批次分組 ──────────────────────────────────────────────────────
export interface BatchGroup {
    batchNo: number;               // 0=退貨, 1~N=第幾批進貨, -1=NOT_FOUND_IN_PDF虛擬行
    deliveryDate: string | null;   // ISO date "2026-02-09"
    items: InvoiceItemDto[];
}

// ── 上傳/查詢對帳單的完整 Response ───────────────────────────────
export interface SupplierInvoiceResponse {
    invoiceId: number;
    deliveryAddress: string | null;  // 送貨地點（核對案件地址用）
    receivableAmount: number | null; // 應收總額
    cashDiscount: number | null;     // 現金扣款
    netPayable: number | null;       // 付現應收
    batches: BatchGroup[];           // 依批次分組的明細
    // 比對統計
    okCount: number;
    notFoundInSysCount: number;
    notFoundInPdfCount: number;
    qtyMismatchCount: number;
    priceMismatchCount: number;
    batchNotFoundCount: number;
    returnedCount: number;
}

export interface UpdateInvoiceAmountRequest {
    receivableAmount: number
    cashDiscount: number
    netPayable: number
}
