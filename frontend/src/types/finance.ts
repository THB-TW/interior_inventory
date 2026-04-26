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

export type InvoiceStatus = 'PENDING_REVIEW' | 'CONFIRMED';

export type InvoiceItemMatchStatus = 'OK' | 'QTY_MISMATCH' | 'PRICE_MISMATCH' | 'NOT_FOUND';

export interface SupplierInvoiceItem {
    id: number;
    materialName: string;
    specification: string | null;
    unit: string;
    quantity: number | null;
    unitPrice: number;
    totalPrice: number | null;
    isReturn: boolean;
    matchStatus: InvoiceItemMatchStatus;
    caseMaterialId: number | null;
}

export interface SupplierInvoice {
    id: number;
    projectId: number;
    supplierName: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number | null;
    status: InvoiceStatus;
    uploadedAt: string;
    confirmedAt: string | null;
    pdfPath: string | null;
    items: SupplierInvoiceItem[];
}

export interface InvoiceCompareItem {
    materialName: string;
    specification: string | null;
    unit: string;
    invoiceQty: number | null;
    invoiceUnitPrice: number;
    invoiceTotalPrice: number | null;
    systemQty: number | null;
    systemUnitPrice: number | null;
    matchStatus: InvoiceItemMatchStatus;
    caseMaterialId: number | null;
}

export interface InvoiceCompareResult {
    tempInvoiceId: number;
    supplierName: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number | null;
    items: InvoiceCompareItem[];
    okCount: number;
    mismatchCount: number;
    notFoundCount: number;
}