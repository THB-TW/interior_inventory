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
    profit: number;
    profitRate: number | null;
}

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'COMPLETED';