import apiClient from '@/lib/apiClient'
import type { SupplierInvoiceResponse, UpdateInvoiceAmountRequest } from '@/types/finance'

const BASE = '/finance/supplier-invoices'

export const supplierInvoiceService = {

    /** POST /api/finance/supplier-invoices/upload
     *  form-data: projectId, file
     *  → 解析比對結果
     */
    uploadAndParse: (
        projectId: number,
        file: File
    ): Promise<SupplierInvoiceResponse> => {
        const form = new FormData()
        form.append('projectId', String(projectId))
        form.append('file', file)
        return apiClient
            .post(`${BASE}/upload`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then(r => r.data)
    },

    /** GET /api/finance/supplier-invoices/{invoiceId}
     *  → 單一對帳單完整明細
     */
    getDetail: (invoiceId: number): Promise<SupplierInvoiceResponse> =>
        apiClient.get(`${BASE}/${invoiceId}`).then(r => r.data),

    /** GET /api/finance/supplier-invoices/project/{projectId}
     *  → 案件所有歷史對帳單列表
     */
    listByProject: (projectId: number): Promise<SupplierInvoiceResponse[]> =>
        apiClient.get(`${BASE}/project/${projectId}`).then(r => r.data),

    /** PATCH /api/finance/supplier-invoices/{invoiceId}/amounts
     *  人工修正應收總額、現金扣款、付現應收
     */
    updateAmounts: (
        invoiceId: number,
        data: UpdateInvoiceAmountRequest
    ): Promise<SupplierInvoiceResponse> =>
        apiClient
            .patch(`${BASE}/${invoiceId}/amounts`, data)
            .then(r => r.data),

}