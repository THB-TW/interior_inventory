import apiClient from '@/lib/apiClient';
import type {
    SupplierInvoice,
    InvoiceCompareResult,
} from '@/types/finance';

const BASE = '/finance/supplier-invoices';

export const supplierInvoiceService = {

    upload: (projectId: number, file: File): Promise<InvoiceCompareResult> => {
        const form = new FormData();
        form.append('file', file);
        return apiClient.post(
            `${BASE}/upload?projectId=${projectId}`,
            form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        ).then(r => r.data);
    },

    confirm: (tempInvoiceId: number, projectId: number): Promise<void> =>
        apiClient.post(`${BASE}/confirm`, { tempInvoiceId, projectId }).then(() => undefined),

    getByProject: (projectId: number): Promise<SupplierInvoice[]> =>
        apiClient.get(`${BASE}/project/${projectId}`).then(r => r.data),
};