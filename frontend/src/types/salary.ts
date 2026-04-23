export type WageType = 'DAILY' | 'MONTHLY' | 'PROJECT_SHARE'
export type SalaryStatus = 'PENDING' | 'CONFIRMED' | 'PAID'
export type PeriodType = 'MONTHLY_FIRST' | 'MONTHLY_SECOND'

// ── Period ───────────────────────────────────────────────

export interface SalaryPeriod {
    periodId: number
    periodLabel: string        // e.g. "2026年4月上旬"
    periodType: PeriodType
    year: number
    month: number
    status: SalaryStatus
    workers: WorkerSalarySummary[]
    totalAmount: number
    paidAmount: number
    unpaidAmount: number
}

// ── Worker 彙總（一個師傅在此期的所有項目）───────────────

export interface WorkerSalarySummary {
    workerId: number
    workerName: string
    wageType: WageType
    items: SalaryItemDetail[]
    subtotal: number
    allPaid: boolean
}

// ── 單筆薪資項目 ─────────────────────────────────────────

export interface SalaryItemDetail {
    itemId: number
    caseId?: number
    caseName?: string
    wageType: WageType
    baseAmount: number
    adjustment: number
    finalAmount: number
    isPaid: boolean
    paidAt?: string
    note?: string
}

// ── Request ──────────────────────────────────────────────

export interface SalaryPeriodCreateRequest {
    periodType: PeriodType
    year: number
    month: number
    startDate?: string    // ISO date, 若 null 後端自動推算
    endDate?: string
}

export interface SalaryItemAdjustRequest {
    adjustment: number
    note?: string
}