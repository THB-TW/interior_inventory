import apiClient from '@/lib/apiClient';
import type { QuoteProjectUsage, QuoteMaterialLineResponse } from '@/types/quote';

const BASE = '/quote';

/**
 * 取得報價 / 案件用料總覽列表
 * 對應後端 GET /api/quote
 */
export async function getQuoteOverview(): Promise<QuoteProjectUsage[]> {
    const response = await apiClient.get<QuoteProjectUsage[]>(BASE);
    return (response.data || []) as QuoteProjectUsage[];
}
/**
 * 取得單一案件的用料 / 報價總覽
 * GET /api/quote/{projectId}
 */
export async function getProjectQuoteUsage(projectId: number): Promise<QuoteProjectUsage[]> {
    const response = await apiClient.get<QuoteProjectUsage[]>(`${BASE}/${projectId}`);
    return (response.data || []) as QuoteProjectUsage[];
}

/**
 * 新增某案件的一筆用料
 * POST /api/quote/{projectId}/casematerials
 */
export interface QuoteMaterialPayload {
    materialId: number;
    materialType: string; // 'PURCHASE' | 'LEFTOVER' | 'RETURN'
    quantity: number;
    unitPrice?: number;
}

export async function createProjectMaterial(
    projectId: number,
    payload: QuoteMaterialPayload,
): Promise<QuoteProjectUsage> {
    const response = await apiClient.post<QuoteProjectUsage>(`${BASE}/${projectId}/casematerials`, payload);
    return response.data;
}

/**
 * 更新某案件的一筆用料
 * PUT /api/quote/{projectId}/casematerials/{caseMaterialId}
 */
export async function updateProjectMaterial(
    projectId: number,
    caseMaterialId: number,
    payload: QuoteMaterialPayload,
): Promise<QuoteProjectUsage> {
    const response = await apiClient.put<QuoteProjectUsage>(
        `${BASE}/${projectId}/casematerials/${caseMaterialId}`,
        payload,
    );
    return response.data;
}

/**
 * 刪除某案件的一筆用料
 * DELETE /api/quote/{projectId}/casematerials/{caseMaterialId}
 */
export async function deleteProjectMaterial(
    projectId: number,
    caseMaterialId: number,
): Promise<void> {
    await apiClient.delete(`${BASE}/${projectId}/casematerials/${caseMaterialId}`);
}

export async function getCaseMaterialLines(
    projectId: number,
): Promise<QuoteMaterialLineResponse[]> {
    const response = await apiClient.get<QuoteMaterialLineResponse[]>(
        `${BASE}/${projectId}/casematerials`,
    );
    return (response.data || []) as QuoteMaterialLineResponse[];
}