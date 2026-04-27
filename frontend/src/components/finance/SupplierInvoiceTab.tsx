import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, RefreshCw, AlertCircle, FileText, Package } from 'lucide-react'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { supplierInvoiceService } from '@/services/supplierInvoiceService'
import { getProjectQuoteUsage } from '@/services/quoteService'
import StatusBadge from '@/components/common/StatusBadge'
import { CASE_MATERIAL_TYPE_LABELS } from '@/types/quote'
import type { SupplierInvoiceResponse, InvoiceItemMatchStatus } from '@/types/finance'
import type { QuoteProjectUsage, QuoteMaterialLineResponse } from '@/types/quote'

type FilterStatus = 'ALL' | InvoiceItemMatchStatus

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
    { value: 'ALL', label: '全部' },
    { value: 'OK', label: '吻合' },
    { value: 'QTY_MISMATCH', label: '數量異常' },
    { value: 'PRICE_MISMATCH', label: '單價異常' },
    { value: 'NOT_FOUND_IN_SYS', label: '未登錄於系統' },
    { value: 'NOT_FOUND_IN_PDF', label: '未出現在收款對帳單' },
]

interface Props {
    projectId: number
}

export default function SupplierInvoiceTab({ projectId }: Props) {
    const queryClient = useQueryClient()
    const fileRef = useRef<HTMLInputElement>(null)
    const [filter, setFilter] = useState<FilterStatus>('ALL')

    // ── 查詢對帳單（只取第一筆）─────────────────────────────────
    const { data: invoices = [], isLoading } = useQuery<SupplierInvoiceResponse[]>({
        queryKey: ['supplier-invoices', projectId],
        queryFn: () => supplierInvoiceService.listByProject(projectId),
    })
    const invoice: SupplierInvoiceResponse | null = invoices[0] ?? null

    // ── 查詢已送出叫貨材料（複用報價頁 API）─────────────────────
    const { data: quoteUsage } = useQuery<QuoteProjectUsage[]>({
        queryKey: ['project-quote-usage', projectId],
        queryFn: () => getProjectQuoteUsage(projectId),
    })
    const projectOrderBatch = quoteUsage?.[0]?.orderBatch ?? null
    const allCaseMaterials: QuoteMaterialLineResponse[] = quoteUsage?.[0]?.quotation ?? []
    // 只顯示已送出批次（orderBatch < 當前批次號碼）
    const confirmedMaterials = projectOrderBatch != null
        ? allCaseMaterials.filter(cm => cm.orderBatch < projectOrderBatch)
        : []

    // ── 核對區分組（提到 return 前，避免 JSX 裡用 IIFE）────────
    const groupedConfirmed = confirmedMaterials.reduce<Record<number, QuoteMaterialLineResponse[]>>(
        (acc, cm) => {
            if (!acc[cm.orderBatch]) acc[cm.orderBatch] = []
            acc[cm.orderBatch].push(cm)
            return acc
        },
        {}
    )
    const sortedBatches = Object.entries(groupedConfirmed)
        .sort(([a], [b]) => Number(a) - Number(b))

    // ── 上傳 PDF ─────────────────────────────────────────────────
    const uploadMutation = useMutation({
        mutationFn: (file: File) =>
            supplierInvoiceService.uploadAndParse(projectId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplier-invoices', projectId] })
            setFilter('ALL')
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadMutation.mutate(file)
        e.target.value = ''
    }

    const alertCount = invoice
        ? invoice.qtyMismatchCount + invoice.priceMismatchCount + invoice.notFoundInSysCount
        : 0

    return (
        <div className="flex flex-col gap-4">

            {/* ── 上傳 / 重新上傳按鈕列 ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <FileText size={15} />
                    <span>{invoice ? '已有對帳單，可重新上傳覆蓋' : '尚無對帳單'}</span>
                </div>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-sm rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {invoice
                        ? <RefreshCw size={15} className={clsx(uploadMutation.isPending && 'animate-spin')} />
                        : <Upload size={15} />
                    }
                    {uploadMutation.isPending ? '解析中...' : invoice ? '重新上傳' : '上傳 PDF'}
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

            {/* ── 載入中 ── */}
            {isLoading && (
                <div className="text-center py-12 text-slate-400 text-sm">載入中...</div>
            )}

            {/* ── 無對帳單 ── */}
            {!isLoading && !invoice && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <FileText size={40} className="text-slate-300" />
                    <p className="text-sm">尚無對帳單，請上傳建材商 PDF</p>
                </div>
            )}

            {/* ── 有對帳單時顯示內容 ── */}
            {!isLoading && invoice && (
                <div className="flex flex-col gap-5">

                    {/* 金額摘要列 */}
                    <div className="flex flex-wrap items-center gap-6 px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-400">應收總額</span>
                            <span className="font-mono font-semibold text-slate-800">
                                ${invoice.receivableAmount?.toLocaleString() ?? '—'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-400">現金折扣</span>
                            <span className="font-mono font-semibold text-emerald-600">
                                -{invoice.cashDiscount?.toLocaleString() ?? '0'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-400">付現應收</span>
                            <span className="font-mono font-bold text-slate-900 text-base">
                                ${invoice.netPayable?.toLocaleString() ?? '—'}
                            </span>
                        </div>
                        {invoice.deliveryAddress && (
                            <div className="flex flex-col gap-0.5 ml-auto">
                                <span className="text-xs text-slate-400">送貨地點</span>
                                <span className="text-slate-600 text-xs">{invoice.deliveryAddress}</span>
                            </div>
                        )}
                        {alertCount > 0 && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-200 ml-auto">
                                <AlertCircle size={11} />
                                {alertCount} 筆異常
                            </div>
                        )}
                    </div>

                    {/* 狀態篩選列 */}
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {FILTER_OPTIONS.map(opt => {
                            const cnt =
                                opt.value === 'ALL' ? null :
                                    opt.value === 'OK' ? invoice.okCount :
                                        opt.value === 'QTY_MISMATCH' ? invoice.qtyMismatchCount :
                                            opt.value === 'PRICE_MISMATCH' ? invoice.priceMismatchCount :
                                                opt.value === 'NOT_FOUND_IN_SYS' ? invoice.notFoundInSysCount :
                                                    opt.value === 'NOT_FOUND_IN_PDF' ? invoice.notFoundInPdfCount : 0

                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilter(opt.value)}
                                    className={clsx(
                                        'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                                        filter === opt.value
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                                    )}
                                >
                                    {opt.label}
                                    {cnt != null && cnt > 0 && (
                                        <span className="ml-1 opacity-70">({cnt})</span>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* ── PDF 批次分組表格 ── */}
                    <div className="flex flex-col gap-5">
                        {invoice.batches.map(batch => {
                            const batchLabel =
                                batch.batchNo === 0 ? '退貨'
                                    : batch.batchNo === -1 ? '未出現（系統有，PDF 無）'
                                        : `第 ${batch.batchNo} 批`

                            const dateLabel = batch.deliveryDate
                                ? dayjs(batch.deliveryDate).format('YYYY/MM/DD')
                                : null

                            const visibleItems = filter === 'ALL'
                                ? batch.items
                                : batch.items.filter(it => it.matchStatus === filter)

                            if (visibleItems.length === 0) return null

                            return (
                                <div
                                    key={batch.batchNo}
                                    className="rounded-xl border border-slate-200 overflow-hidden shadow-sm"
                                >
                                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
                                        <span className={clsx(
                                            'text-sm font-semibold',
                                            batch.batchNo === 0 ? 'text-orange-600'
                                                : batch.batchNo === -1 ? 'text-slate-400'
                                                    : 'text-slate-700'
                                        )}>
                                            {batchLabel}
                                        </span>
                                        {dateLabel && (
                                            <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                                                {dateLabel}
                                            </span>
                                        )}
                                        <span className="ml-auto text-xs text-slate-400">
                                            {visibleItems.length} 項
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-xs text-slate-500 bg-white border-b border-slate-100">
                                                    <th className="px-4 py-2.5 text-left font-medium">材料名稱</th>
                                                    <th className="px-4 py-2.5 text-center font-medium">單位</th>
                                                    <th className="px-4 py-2.5 text-right font-medium">數量</th>
                                                    <th className="px-4 py-2.5 text-right font-medium">單價</th>
                                                    <th className="px-4 py-2.5 text-right font-medium">小計</th>
                                                    <th className="px-4 py-2.5 text-center font-medium">比對</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visibleItems.map(it => (
                                                    <tr
                                                        key={it.itemId}
                                                        className={clsx(
                                                            'border-b border-slate-50 hover:bg-slate-50 transition-colors',
                                                            it.matchStatus === 'NOT_FOUND_IN_PDF' && 'opacity-40'
                                                        )}
                                                    >
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
                                                            {it.unitPrice != null
                                                                ? `$${it.unitPrice.toLocaleString()}`
                                                                : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                                                            {it.totalPrice != null
                                                                ? `$${it.totalPrice.toLocaleString()}`
                                                                : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <StatusBadge status={it.matchStatus} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        })}

                        {/* 篩選後全部為空 */}
                        {filter !== 'ALL' && invoice.batches.every(b =>
                            b.items.every(it => it.matchStatus !== filter)
                        ) && (
                                <div className="py-8 text-center text-slate-400 text-sm">
                                    此篩選條件無資料
                                </div>
                            )}
                    </div>

                    {/* ── 系統已送出材料核對區 ── */}
                    {confirmedMaterials.length > 0 && (
                        <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">

                            <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                                <Package size={15} />
                                <span>系統登錄材料（供人工核對）</span>
                                <span className="ml-1 text-xs font-normal text-slate-400">
                                    共 {confirmedMaterials.length} 筆
                                </span>
                            </div>

                            {sortedBatches.map(([batch, items]) => {
                                const subtotal = items.reduce(
                                    (sum, it) => sum + (it.lineCost ?? 0), 0
                                )
                                return (
                                    <div
                                        key={batch}
                                        className="rounded-xl border border-slate-200 overflow-hidden shadow-sm"
                                    >
                                        <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
                                            <span className="text-sm font-semibold text-slate-700">
                                                第 {batch} 批叫貨
                                            </span>
                                            <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                                                {items.length} 項
                                            </span>
                                            {subtotal > 0 && (
                                                <span className="ml-auto text-xs font-mono text-slate-500">
                                                    小計 ${subtotal.toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-xs text-slate-500 bg-white border-b border-slate-100">
                                                        <th className="px-4 py-2.5 text-left font-medium">材料名稱</th>
                                                        <th className="px-4 py-2.5 text-left font-medium">規格</th>
                                                        <th className="px-4 py-2.5 text-center font-medium">單位</th>
                                                        <th className="px-4 py-2.5 text-center font-medium">類型</th>
                                                        <th className="px-4 py-2.5 text-right font-medium">數量</th>
                                                        <th className="px-4 py-2.5 text-right font-medium">單價</th>
                                                        <th className="px-4 py-2.5 text-right font-medium">小計</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map(cm => (
                                                        <tr
                                                            key={cm.caseMaterialId}
                                                            className={clsx(
                                                                'border-b border-slate-50 hover:bg-slate-50 transition-colors',
                                                                cm.materialType === 'RETURN' && 'opacity-50'
                                                            )}
                                                        >
                                                            <td className="px-4 py-3 text-slate-800 font-medium">
                                                                {cm.materialName}
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-500 text-xs">
                                                                {cm.materialSpec || '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-slate-500 text-xs">
                                                                {cm.materialUnit || '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={clsx(
                                                                    'px-2 py-0.5 rounded-full text-xs font-medium',
                                                                    cm.materialType === 'PURCHASE' && 'bg-blue-50 text-blue-600',
                                                                    cm.materialType === 'LEFTOVER' && 'bg-amber-50 text-amber-600',
                                                                    cm.materialType === 'RETURN' && 'bg-red-50 text-red-500',
                                                                )}>
                                                                    {CASE_MATERIAL_TYPE_LABELS[cm.materialType]}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono text-slate-700">
                                                                {cm.quantity}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono text-slate-700">
                                                                {cm.unitPrice != null
                                                                    ? `$${cm.unitPrice.toLocaleString()}`
                                                                    : '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono text-slate-700">
                                                                {cm.lineCost != null
                                                                    ? `$${cm.lineCost.toLocaleString()}`
                                                                    : '—'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                </div>
            )}

        </div>
    )
}