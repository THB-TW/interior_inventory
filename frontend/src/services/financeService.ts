import apiClient from '@/lib/apiClient';
import type { ProjectProfitDTO } from '@/types/finance';

export const financeService = {
    getAllProfits: (): Promise<ProjectProfitDTO[]> =>
        apiClient.get('/finance/projects').then(r => r.data),

    getProjectProfit: (id: number): Promise<ProjectProfitDTO> =>
        apiClient.get(`/finance/projects/${id}`).then(r => r.data),

    updateContractInfo: (id: number, payload: {
        contractAmount: number;
        receivedAmount: number;
        paymentStatus: string;
    }) => apiClient.patch(`/projects/${id}/contract`, payload).then(r => r.data),
};