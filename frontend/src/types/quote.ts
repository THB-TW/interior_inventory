import type { ProjectStatus } from '@/types/project';

export const CaseMaterialType = {
    PURCHASE: 'PURCHASE',
    LEFTOVER: 'LEFTOVER',
    RETURN: 'RETURN',
} as const;

export type CaseMaterialType = keyof typeof CaseMaterialType;

// 中文顯示用
export const CASE_MATERIAL_TYPE_LABELS: Record<CaseMaterialType, string> = {
    PURCHASE: '進貨',
    LEFTOVER: '剩料',
    RETURN: '退貨',
};


// 對應後端 QuoteMaterialResponse
export interface QuoteMaterialResponse {
    materialId: number;
    materialName: string;
    purchaseQuantity: number;
    leftoverQuantity: number;
    returnQuantity: number;
    totalQuantity: number;
}

export interface QuoteProjectUsage {
    projectId: number;
    projectCode: string;
    status: ProjectStatus;
    clientName: string;
    address: string;
    description: string;
    materials: QuoteMaterialResponse[];
}