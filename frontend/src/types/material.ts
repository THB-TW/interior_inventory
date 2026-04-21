export interface MaterialResponse {
    id: number;
    name: string;
    unit: string;
    description: string | null;
    defaultPrice: number | null;
    isActive: boolean;
}

export interface MaterialSaveRequest {
    name: string;
    unit: string;
    description?: string;
    defaultPrice?: number;
    isActive?: boolean;
}