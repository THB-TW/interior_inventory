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
    caseMaterialId: number;
    materialId: number;
    materialName: string;
    purchaseQuantity: number;
    leftoverQuantity: number;
    returnQuantity: number;
    totalQuantity: number;
    unitPrice: number | null;
    lineCost: number | null;
    createdAt: string;
    orderBatch: number;
}

export interface QuoteProjectUsage {
    projectId: number;
    projectCode: string;
    status: ProjectStatus;
    clientName: string;
    address: string;
    description: string;
    orderBatch: number;
    materials: QuoteMaterialResponse[];
    quotation: QuoteMaterialLineResponse[];
}

export interface QuoteMaterialLineResponse {
    caseMaterialId: number;
    materialId: number;
    materialName: string;
    materialCode: string;
    materialSpec: string;
    materialUnit: string;
    materialType: CaseMaterialType;
    quantity: number;
    unitPrice: number | null;
    lineCost: number | null;
    createdAt: string;
    orderBatch: number;
}