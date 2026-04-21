import apiClient from '@/lib/apiClient';
import type { QuoteProjectUsage } from '@/types/quote';

const BASE = '/quote';

/**
 * 取得報價 / 案件用料總覽列表
 * 對應後端 GET /api/quote
 */
export async function getQuoteOverview(): Promise<QuoteProjectUsage[]> {
    const response = await apiClient.get<QuoteProjectUsage[]>(BASE);
    return (response.data || []) as QuoteProjectUsage[];
}