import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, ChevronDown, ChevronUp, AlertCircle, History } from 'lucide-react'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { supplierInvoiceService } from '@/services/supplierInvoiceService'
import StatusBadge from '@/components/common/StatusBadge'
import Pagination from '@/components/common/Pagination'
import type { SupplierInvoiceResponse, InvoiceItemMatchStatus, BatchGroup } from '@/types/finance'

// ── 狀態篩選設定 ──────────────────────────────────────────────────
type FilterStatus = 'ALL' | InvoiceItemMatchStatus

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
    { value: 'ALL', label: '全部' },
    { value: 'OK', label: '吻合' },
    { value: 'QTY_MISMATCH', label: '數量異常' },
    { value: 'PRICE_MISMATCH', label: '單價異常' },
    { value: 'NOT_FOUND_IN_SYS', label: '未登錄' },
    { value: 'NOT_FOUND_IN_PDF', label: '未出現' },
]

const PAGE_SIZE = 15

interface Props {
    projectId: number
}

export default function SupplierInvoiceTab({ projectId }: Props) {
    const queryClient = useQueryClient()
    const fileRef = useRef<HTMLInputElement>(null)

    // 歷史對帳單列表分頁
    const [listPage, setListPage] = useState(0)
    // 展開中的對帳單 id
    const [expandedId, setExpandedId] = useState<number | null>(null)
    // 各對帳單的明細篩選狀態
    const [filterMap, setFilterMap] = useState<Record<number, FilterStatus>>({})
    // 各對帳單的明細分頁
    const [detailPageMap, setDetailPageMap] = useState<Record<number, number>>({})

    // ── 查詢歷史對帳單 ─────────────────────────────────────────────
    const { data: invoices = [], isLoading } = useQuery<SupplierInvoiceResponse[]>({
        queryKey: ['supplier-invoices', projectId],
        queryFn: () => supplierInvoiceService.listByProject(projectId),
    })

    // 前端分頁
    const totalPages = Math.ceil(invoices.length / PAGE_SIZE)
    const paginated = invoices.slice(listPage * PAGE_SIZE, (listPage + 1) * PAGE_SIZE)

    // ── 上傳 PDF ──────────────────────────────────────────────────
    const uploadMutation = useMutation({
        mutationFn: (file: File) =>
            supplierInvoiceService.uploadAndParse(projectId, file),
        onSuccess: (newInvoice) => {
            queryClient.invalidateQueries({ queryKey: ['supplier-invoices', projectId] })
            setExpandedId(newInvoice.invoiceId)
            setListPage(0)
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadMutation.mutate(file)
        e.target.value = ''
    }

    // ── 工具函式 ──────────────────────────────────────────────────
    const getFilter = (id: number): FilterStatus => filterMap[id] ?? 'ALL'
    const getDetailPage = (id: number): number => detailPageMap[id] ?? 0

    const setFilter = (id: number, f: FilterStatus) => {
        setFilterMap(prev => ({ ...prev, [id]: f }))
        setDetailPageMap(prev => ({ ...prev, [id]: 0 }))
    }

    const setDetailPage = (id: number, p: number) =>
        setDetailPageMap(prev => ({ ...prev, [id]: p }))

    // 依篩選條件過濾明細（攤平所有 batch 的 items）
    const getFilteredItems = (invoice: SupplierInvoiceResponse) => {
        const allItems = invoice.batches.flatMap(b =>
            b.items.map(it => ({ ...it, batchNo: b.batchNo, deliveryDate: b.deliveryDate }))
        )
        const f = getFilter(invoice.invoiceId)
        return f === 'ALL' ? allItems : allItems.filter(it => it.matchStatus === f)
    }

    // 統計有異常的總數（用於 badge 提示）
    const alertCount = (inv: SupplierInvoiceResponse) =>
        inv.qtyMismatchCount + inv.priceMismatchCount + inv.notFoundInSysCount

    return (
        <div className="flex flex-col gap-4">

            {/* ── 上傳按鈕 ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <History size={15} />
                    <span>共 {invoices.length} 份對帳單</span>
                </div>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-sm rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Upload size={15} />
                    {uploadMutation.isPending ? '解析中...' : '上傳 PDF'}
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* ── 上傳錯誤 ── */}
            {uploadMutation.isError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle size={15} />
                    <span>{(uploadMutation.error as Error).message}</span>
                </div>
            )}

            {/* ── 對帳單列表 ── */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-400 text-sm">載入中...</div>
            ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <History size={40} className="text-slate-300" />
                    <p className="text-sm">尚無對帳單，請上傳 PDF</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-3">
                        {paginated.map(inv => {
                            const isOpen = expandedId === inv.invoiceId
                            const alerts = alertCount(inv)
                            const filtered = getFilteredItems(inv)
                            const pg = getDetailPage(inv.invoiceId)
                            const pgTotal = Math.ceil(filtered.length / PAGE_SIZE)
                            const pageItems = filtered.slice(pg * PAGE_SIZE, (pg + 1) * PAGE_SIZE)

                            return (
                                <div
                                    key={inv.invoiceId}
                                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                                >
                                    {/* ── 對帳單 Header（可折疊） ── */}
                                    <button
                                        onClick={() => setExpandedId(isOpen ? null : inv.invoiceId)}
                                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-semibold text-slate-800 truncate">
                                                        #{inv.invoiceId}
                                                    </span>
                                                    {inv.deliveryAddress && (
                                                        <span className="text-xs text-slate-500 truncate max-w-xs">
                                                            {inv.deliveryAddress}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                                                    {inv.netPayable != null && (
                                                        <span>付現應收：
                                                            <span className="font-mono font-medium text-slate-700">
                                                                ${inv.netPayable.toLocaleString()}
                                                            </span>
                                                        </span>
                                                    )}
                                                    {inv.cashDiscount != null && inv.cashDiscount > 0 && (
                                                        <span className="text-emerald-600">
                                                            現金折扣 -${inv.cashDiscount.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                            {/* 比對統計 badges */}
                                            {inv.okCount > 0 && (
                                                <StatusBadge status="OK" />
                                            )}
                                            {alerts > 0 && (
                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                    <AlertCircle size={11} />
                                                    {alerts} 筆異常
                                                </span>
                                            )}
                                            {inv.notFoundInPdfCount > 0 && (
                                                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                    {inv.notFoundInPdfCount} 未出現
                                                </span>
                                            )}
                                            {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                        </div>
                                    </button>

                                    {/* ── 展開內容 ── */}
                                    {isOpen && (
                                        <div className="border-t border-slate-100">

                                            {/* 狀態篩選列 */}
                                            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100 overflow-x-auto">
                                                {FILTER_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setFilter(inv.invoiceId, opt.value)}
                                                        className={clsx(
                                                            'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                                                            getFilter(inv.invoiceId) === opt.value
                                                                ? 'bg-[var(--color-primary)] text-white'
                                                                : 'bg-white border border-slate-200 text-slate-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                                                        )}
                                                    >
                                                        {opt.label}
                                                        {opt.value !== 'ALL' && (() => {
                                                            const cnt =
                                                                opt.value === 'OK' ? inv.okCount :
                                                                    opt.value === 'QTY_MISMATCH' ? inv.qtyMismatchCount :
                                                                        opt.value === 'PRICE_MISMATCH' ? inv.priceMismatchCount :
                                                                            opt.value === 'NOT_FOUND_IN_SYS' ? inv.notFoundInSysCount :
                                                                                opt.value === 'NOT_FOUND_IN_PDF' ? inv.notFoundInPdfCount : 0
                                                            return cnt > 0 ? (
                                                                <span className="ml-1 opacity-70">({cnt})</span>
                                                            ) : null
                                                        })()}
                                                    </button>
                                                ))}
                                                <span className="ml-auto text-xs text-slate-400 shrink-0">
                                                    {filtered.length} 筆
                                                </span>
                                            </div>

                                            {/* 明細表格 */}
                                            {filtered.length === 0 ? (
                                                <div className="py-8 text-center text-slate-400 text-sm">
                                                    此篩選條件無資料
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100">
                                                                    <th className="px-4 py-2.5 text-left font-medium">批次</th>
                                                                    <th className="px-4 py-2.5 text-left font-medium">出貨日</th>
                                                                    <th className="px-4 py-2.5 text-left font-medium">材料名稱</th>
                                                                    <th className="px-4 py-2.5 text-center font-medium">單位</th>
                                                                    <th className="px-4 py-2.5 text-right font-medium">數量</th>
                                                                    <th className="px-4 py-2.5 text-right font-medium">單價</th>
                                                                    <th className="px-4 py-2.5 text-right font-medium">小計</th>
                                                                    <th className="px-4 py-2.5 text-center font-medium">比對</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {pageItems.map(it => (
                                                                    <tr
                                                                        key={it.itemId}
                                                                        className={clsx(
                                                                            'border-b border-slate-50 hover:bg-slate-50 transition-colors',
                                                                            it.matchStatus === 'NOT_FOUND_IN_PDF' && 'opacity-50'
                                                                        )}
                                                                    >
                                                                        <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                                                                            {it.batchNo === 0 ? '退貨' : it.batchNo === -1 ? '—' : `#${it.batchNo}`}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                                                                            {it.deliveryDate ? dayjs(it.deliveryDate).format('MM/DD') : '—'}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-slate-800 font-medium max-w-xs truncate">
                                                                            {it.materialNameRaw}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-center text-slate-500 text-xs">
                                                                            {it.unit || '—'}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                                                                            {it.quantity != null ? it.quantity : '—'}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                                                                            {it.unitPrice != null ? `$${it.unitPrice.toLocaleString()}` : '—'}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                                                                            {it.totalPrice != null ? `$${it.totalPrice.toLocaleString()}` : '—'}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-center">
                                                                            <StatusBadge status={it.matchStatus} />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* 明細分頁 */}
                                                    {pgTotal > 1 && (
                                                        <Pagination
                                                            currentPage={pg}
                                                            totalPages={pgTotal}
                                                            totalElements={filtered.length}
                                                            pageSize={PAGE_SIZE}
                                                            onPageChange={p => setDetailPage(inv.invoiceId, p)}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* 對帳單列表分頁 */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={listPage}
                            totalPages={totalPages}
                            totalElements={invoices.length}
                            pageSize={PAGE_SIZE}
                            onPageChange={p => {
                                setListPage(p)
                                setExpandedId(null)
                            }}
                        />
                    )}
                </>
            )}
        </div>
    )
}