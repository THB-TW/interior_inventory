/**
 * 預覽獎金試算的回傳格式
 * 對應後端: BonusPreviewResponse
 */
export interface BonusPreviewResponse {
    workerId: number;
    workerName: string;
    totalDays: number;
    calculatedAmount: number;
}

/**
 * 確認發放明細的請求格式
 * 對應後端: BonusItemRequest
 */
export interface BonusItemRequest {
    workerId: number;
    totalDays: number;
    calculatedAmount: number;
    actualAmount: number;
}

/**
 * 確認發放主檔的請求格式
 * 對應後端: BonusConfirmRequest
 */
export interface BonusConfirmRequest {
    startDate: string; // 格式: 'YYYY-MM-DD'
    endDate: string;   // 格式: 'YYYY-MM-DD'
    label: string;     // 例如: "2026 端午節獎金"
    dailyRate: number; // 每日基準 (例如: 100)
    items: BonusItemRequest[];
}