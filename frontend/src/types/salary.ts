export type WageType = 'DAILY' | 'PROJECT_SHARE'
export type SalaryStatus = 'PENDING' | 'CONFIRMED' | 'PAID'

// ── 對映 SalaryPeriodResponse ────────────────────────

export interface SalaryPeriod {
    id: number
    periodStart: string        // ISO date (LocalDate)
    periodEnd: string
    label: string              // e.g. "2026年4月上旬"
    status: SalaryStatus
    totalAmount: number        // BigDecimal → number
    paidAmount: number
    unpaidAmount: number
    createdAt: string          // ISO datetime
    workers: WorkerSalarySummary[] | null
}

// ── 對映 WorkerSalarySummary ─────────────────────────

export interface WorkerSalarySummary {
    workerId: number
    workerNickname: string
    wageType: WageType
    subtotal: number
    paidAmount: number
    unpaidAmount: number
    allPaid: boolean
    items: SalaryItemDetail[] | null
}

// ── 對映 SalaryItemDetail ────────────────────────────

export interface SalaryItemDetail {
    id: number
    periodId: number | null
    workerId: number
    workerNickname: string
    projectId: number | null
    projectCode: string | null
    wageType: WageType
    baseAmount: number
    travelExpenses: number
    adjustment: number
    finalAmount: number
    isPaid: boolean
    paidAt: string | null
    note: string | null
    createdAt: string
}

// ── Request ──────────────────────────────────────────

export interface SalaryPeriodCreateRequest {
    periodStart: string    // ISO date
    periodEnd: string
    label: string
}

export interface SalaryItemAdjustRequest {
    adjustment: number
    note?: string
}