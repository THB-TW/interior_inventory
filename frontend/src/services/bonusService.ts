import apiClient from '@/lib/apiClient';
import type { BonusPreviewResponse, BonusConfirmRequest } from '@/types/bonus';

/**
 * 預覽獎金試算
 * @param startDate 計算區間起始日 (YYYY-MM-DD)
 * @param endDate 計算區間結束日 (YYYY-MM-DD)
 * @param dailyRate 每日基準 (預設 100)
 */
export const previewBonus = async (
    startDate: string,
    endDate: string,
    dailyRate: number = 100
): Promise<BonusPreviewResponse[]> => {
    // 呼叫 GET /api/finance/bonus/preview
    const response = await apiClient.get<BonusPreviewResponse[]>('/finance/bonus/preview', {
        params: {
            startDate,
            endDate,
            dailyRate,
        },
    });

    // 備註：假設你的 apiClient 攔截器 (Interceptor) 已經處理了 ApiResponse 的脫殼，
    // 這裡直接回傳 response.data。如果沒有脫殼，可能需要 return response.data.data;
    return response.data;
};

/**
 * 確認並儲存獎金發放紀錄
 * @param data 包含主檔與明細的完整表單資料
 */
export const confirmBonus = async (data: BonusConfirmRequest): Promise<void> => {
    // 呼叫 POST /api/finance/bonus/confirm
    const response = await apiClient.post<void>('/finance/bonus/confirm', data);
    return response.data;
};