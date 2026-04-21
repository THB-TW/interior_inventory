import apiClient from '@/lib/apiClient';
import type { MaterialResponse } from '@/types/material';

const BASE = '/materials';

export async function getMaterials(): Promise<MaterialResponse[]> {
    const res = await apiClient.get<MaterialResponse[]>(BASE);
    return (res.data || []) as MaterialResponse[];
}

export async function createMaterial(payload: {
    name: string;
    unit: string;
    description?: string;
    defaultPrice?: number;
    isActive?: boolean;
}): Promise<MaterialResponse> {
    const res = await apiClient.post<MaterialResponse>(BASE, payload);
    return res.data as MaterialResponse;
}

export async function updateMaterial(
    id: number,
    payload: {
        name: string;
        unit: string;
        description?: string;
        defaultPrice?: number;
        isActive?: boolean;
    }
): Promise<MaterialResponse> {
    const res = await apiClient.put<MaterialResponse>(`${BASE}/${id}`, payload);
    return res.data as MaterialResponse;
}

export async function deleteMaterial(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
}