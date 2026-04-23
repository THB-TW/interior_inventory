import apiClient from '@/lib/apiClient'
import type {
    SalaryPeriod,
    SalaryItemDetail,
    SalaryPeriodCreateRequest,
    SalaryItemAdjustRequest,
} from '@/types/salary'

const BASE = '/api/finance/salary'

export const salaryService = {

    // ── Period ──────────────────────────────────

    getAllPeriods: (): Promise<SalaryPeriod[]> =>
        apiClient.get(`${BASE}/periods`).then(r => r.data),

    getPeriodById: (periodId: number): Promise<SalaryPeriod> =>
        apiClient.get(`${BASE}/periods/${periodId}`).then(r => r.data),

    createPeriod: (req: SalaryPeriodCreateRequest): Promise<SalaryPeriod> =>
        apiClient.post(`${BASE}/periods`, req).then(r => r.data),

    confirmPeriod: (periodId: number): Promise<SalaryPeriod> =>
        apiClient.patch(`${BASE}/periods/${periodId}/confirm`).then(r => r.data),

    markPeriodPaid: (periodId: number): Promise<SalaryPeriod> =>
        apiClient.patch(`${BASE}/periods/${periodId}/pay`).then(r => r.data),

    // ── Items ────────────────────────────────────

    getItemsByPeriod: (periodId: number): Promise<SalaryItemDetail[]> =>
        apiClient.get(`${BASE}/periods/${periodId}/items`).then(r => r.data),

    getItemsByWorker: (workerId: number): Promise<SalaryItemDetail[]> =>
        apiClient.get(`${BASE}/workers/${workerId}/items`).then(r => r.data),

    adjustItem: (itemId: number, req: SalaryItemAdjustRequest): Promise<SalaryItemDetail> =>
        apiClient.patch(`${BASE}/items/${itemId}/adjust`, req).then(r => r.data),

    markItemPaid: (itemId: number): Promise<SalaryItemDetail> =>
        apiClient.patch(`${BASE}/items/${itemId}/pay`).then(r => r.data),
}