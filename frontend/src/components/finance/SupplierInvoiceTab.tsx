import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, RefreshCw, AlertCircle, FileText, Package, RotateCcw, Pencil, Check, X } from 'lucide-react'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { supplierInvoiceService } from '@/services/supplierInvoiceService'
import { getProjectQuoteUsage } from '@/services/quoteService'
import StatusBadge from '@/components/common/StatusBadge'
import { CASE_MATERIAL_TYPE_LABELS } from '@/types/quote'
import type { SupplierInvoiceResponse, InvoiceItemMatchStatus } from '@/types/finance'
import type { QuoteProjectUsage, QuoteMaterialLineResponse } from '@/types/quote'

type FilterStatus = 'ALL' | InvoiceItemMatchStatus

// ── 篩選選項：新增退貨與批次未叫貨 ──
const FILTER_OPTIONS: {
    value: FilterStatus
    label: string
    activeClass: string
    dotClass: string
}[] = [
        { value: 'ALL', label: '全部', activeClass: 'bg-slate-700 text-white', dotClass: '' },
        { value: 'OK', label: '吻合', activeClass: 'bg-emerald-600 text-white', dotClass: 'bg-emerald-500' },
        { value: 'QTY_MISMATCH', label: '數量異常', activeClass: 'bg-red-600 text-white', dotClass: 'bg-red-500' },
        { value: 'PRICE_MISMATCH', label: '單價異常', activeClass: 'bg-red-500 text-white', dotClass: 'bg-red-400' },
        { value: 'NOT_FOUND_IN_SYS', label: '未登錄', activeClass: 'bg-yellow-500 text-white', dotClass: 'bg-yellow-400' },
        { value: 'BATCH_NOT_FOUND_IN_SYS', label: '批次未叫貨', activeClass: 'bg-orange-500 text-white', dotClass: 'bg-orange-400' },
        { value: 'NOT_FOUND_IN_PDF', label: '未出現在PDF', activeClass: 'bg-slate-500 text-white', dotClass: 'bg-slate-400' },
        { value: 'RETURNED', label: '退貨', activeClass: 'bg-violet-600 text-white', dotClass: 'bg-violet-500' },
    ]

interface Props {
    projectId: number
}

export default function SupplierInvoiceTab({ projectId }: Props) {
    const queryClient = useQueryClient()
    const fileRef = useRef<HTMLInputElement>(null)
    const [filter, setFilter] = useState<FilterStatus>('ALL')

    const [isEditingAmount, setIsEditingAmount] = useState(false)
    const [amountForm, setAmountForm] = useState({
        receivableAmount: 0,
        cashDiscount: 0,
        netPayable: 0,
    })

    const { data: invoices = [], isLoading } = useQuery<SupplierInvoiceResponse[]>({
        queryKey: ['supplier-invoices', projectId],
        queryFn: () => supplierInvoiceService.listByProject(projectId),
    })
    const invoice: SupplierInvoiceResponse | null = invoices[0] ?? null

    const { data: quoteUsage } = useQuery<QuoteProjectUsage[]>({
        queryKey: ['project-quote-usage', projectId],
        queryFn: () => getProjectQuoteUsage(projectId),
    })
    const projectOrderBatch = quoteUsage?.[0]?.orderBatch ?? null
    const allCaseMaterials: QuoteMaterialLineResponse[] = quoteUsage?.[0]?.quotation ?? []
    const confirmedMaterials = projectOrderBatch != null
        ? allCaseMaterials.filter(cm => cm.orderBatch < projectOrderBatch)
        : []

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

    const uploadMutation = useMutation({
        mutationFn: (file: File) =>
            supplierInvoiceService.uploadAndParse(projectId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplier-invoices', projectId] })
            setFilter('ALL')
        },
    })

    const updateAmountMutation = useMutation({
        mutationFn: (data: { receivableAmount: number; cashDiscount: number; netPayable: number }) =>
            supplierInvoiceService.updateAmounts(invoice!.invoiceId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplier-invoices', projectId] })
            setIsEditingAmount(false)
        },
    })

    const handleEditAmount = () => {
        if (!invoice) return
        setAmountForm({
            receivableAmount: invoice.receivableAmount ?? 0,
            cashDiscount: invoice.cashDiscount ?? 0,
            netPayable: invoice.netPayable ?? 0,
        })
        setIsEditingAmount(true)
    }

    const handleSaveAmount = () => {
        updateAmountMutation.mutate(amountForm)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadMutation.mutate(file)
        e.target.value = ''
    }

    // 異常數量：排除退貨不算異常
    const alertCount = invoice
        ? invoice.qtyMismatchCount + invoice.priceMismatchCount + invoice.notFoundInSysCount
        : 0

    // 各 status 對應的 count（供篩選按鈕顯示）
    const getCount = (value: FilterStatus): number | null => {
        if (!invoice || value === 'ALL') return null
        switch (value) {
            case 'OK': return invoice.okCount
            case 'QTY_MISMATCH': return invoice.qtyMismatchCount
            case 'PRICE_MISMATCH': return invoice.priceMismatchCount
            case 'NOT_FOUND_IN_SYS': return invoice.notFoundInSysCount
            case 'BATCH_NOT_FOUND_IN_SYS': return invoice.batchNotFoundCount ?? 0
            case 'NOT_FOUND_IN_PDF': return invoice.notFoundInPdfCount
            case 'RETURNED': return invoice.returnedCount ?? 0
            default: return 0
        }
    }

    return (
        <div className="flex flex-col gap-4">

            {/* ── 上傳按鈕列 ── */}
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

            {uploadMutation.isError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle size={15} />
                    <span>{(uploadMutation.error as Error).message}</span>
                </div>
            )}

            {isLoading && (
                <div className="text-center py-12 text-slate-400 text-sm">載入中...</div>
            )}

            {!isLoading && !invoice && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <FileText size={40} className="text-slate-300" />
                    <p className="text-sm">尚無對帳單，請上傳建材商 PDF</p>
                </div>
            )}

            {!isLoading && invoice && (
                <div className="flex flex-col gap-5">

                    {/* 金額摘要列 */}
                    <div className="flex flex-wrap items-center gap-6 px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 text-sm relative">
                        {!isEditingAmount ? (
                            <>
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

                                <div className="ml-auto flex items-center gap-3">
                                    <button
                                        onClick={handleEditAmount}
                                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-200 transition-colors"
                                        title="編輯金額"
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    {invoice.deliveryAddress && (
                                        <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-3">
                                            <span className="text-xs text-slate-400">送貨地點</span>
                                            <span className="text-slate-600 text-xs">{invoice.deliveryAddress}</span>
                                        </div>
                                    )}
                                    {alertCount > 0 && (
                                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-200 ml-1">
                                            <AlertCircle size={11} />
                                            {alertCount} 筆異常
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">應收總額</span>
                                    <input
                                        type="number"
                                        value={amountForm.receivableAmount}
                                        onChange={e => {
                                            const val = Number(e.target.value)
                                            setAmountForm(prev => ({
                                                ...prev,
                                                receivableAmount: val,
                                                netPayable: val - prev.cashDiscount
                                            }))
                                        }}
                                        className="w-24 px-2 py-1 text-sm border border-slate-300 rounded-md outline-none focus:border-blue-500 font-mono"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">現金折扣</span>
                                    <input
                                        type="number"
                                        value={amountForm.cashDiscount}
                                        onChange={e => {
                                            const val = Number(e.target.value)
                                            setAmountForm(prev => ({
                                                ...prev,
                                                cashDiscount: val,
                                                netPayable: prev.receivableAmount - val
                                            }))
                                        }}
                                        className="w-24 px-2 py-1 text-sm border border-slate-300 rounded-md outline-none focus:border-blue-500 font-mono"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">付現應收</span>
                                    <input
                                        type="number"
                                        value={amountForm.netPayable}
                                        onChange={e => setAmountForm(prev => ({ ...prev, netPayable: Number(e.target.value) }))}
                                        className="w-24 px-2 py-1 text-sm border border-slate-300 rounded-md outline-none focus:border-blue-500 font-mono font-bold"
                                    />
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <button
                                        onClick={() => setIsEditingAmount(false)}
                                        disabled={updateAmountMutation.isPending}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    >
                                        <X size={14} />
                                        取消
                                    </button>
                                    <button
                                        onClick={handleSaveAmount}
                                        disabled={updateAmountMutation.isPending}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                                    >
                                        {updateAmountMutation.isPending ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : (
                                            <Check size={14} />
                                        )}
                                        儲存
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── 狀態篩選列（彩色版）── */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {FILTER_OPTIONS.map(opt => {
                            const cnt = getCount(opt.value)
                            const isActive = filter === opt.value
                            // 沒有資料的選項 → 淡化但還是顯示
                            const isEmpty = cnt !== null && cnt === 0

                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilter(opt.value)}
                                    className={clsx(
                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                                        isActive
                                            ? opt.activeClass
                                            : clsx(
                                                'bg-white border border-slate-200 text-slate-500 hover:border-slate-400',
                                                isEmpty && 'opacity-40'
                                            )
                                    )}
                                >
                                    {/* 未啟用時顯示對應顏色小圓點 */}
                                    {!isActive && opt.dotClass && (
                                        <span className={clsx('w-1.5 h-1.5 rounded-full', opt.dotClass)} />
                                    )}
                                    {opt.label}
                                    {cnt !== null && cnt > 0 && (
                                        <span className={clsx(
                                            'px-1.5 py-0.5 rounded-full text-xs font-bold',
                                            isActive
                                                ? 'bg-white/25 text-white'
                                                : 'bg-slate-100 text-slate-600'
                                        )}>
                                            {cnt}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* ── PDF 批次分組表格 ── */}
                    <div className="flex flex-col gap-5">
                        {invoice.batches.map(batch => {
                            const isReturnBatch = batch.batchNo === 0
                            const isMissingBatch = batch.batchNo === -1

                            const batchLabel =
                                isReturnBatch ? '退貨'
                                    : isMissingBatch ? '未出現（系統有，PDF 無）'
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
                                    className={clsx(
                                        'rounded-xl border overflow-hidden shadow-sm',
                                        isReturnBatch ? 'border-violet-200' :
                                            isMissingBatch ? 'border-slate-200 opacity-60' :
                                                'border-slate-200'
                                    )}
                                >
                                    {/* 批次 Header */}
                                    <div className={clsx(
                                        'flex items-center gap-3 px-5 py-3 border-b',
                                        isReturnBatch ? 'bg-violet-50 border-violet-100' :
                                            isMissingBatch ? 'bg-slate-50 border-slate-100' :
                                                'bg-slate-50 border-slate-100'
                                    )}>
                                        {/* 退貨批次加上 icon */}
                                        {isReturnBatch && (
                                            <RotateCcw size={14} className="text-violet-500 shrink-0" />
                                        )}
                                        <span className={clsx(
                                            'text-sm font-semibold',
                                            isReturnBatch ? 'text-violet-700' :
                                                isMissingBatch ? 'text-slate-400' :
                                                    'text-slate-700'
                                        )}>
                                            {batchLabel}
                                        </span>
                                        {dateLabel && (
                                            <span className={clsx(
                                                'text-xs px-2 py-0.5 rounded-full border',
                                                isReturnBatch
                                                    ? 'bg-white border-violet-200 text-violet-500'
                                                    : 'bg-white border-slate-200 text-slate-400'
                                            )}>
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
                                                            'border-b border-slate-50 transition-colors',
                                                            it.matchStatus === 'NOT_FOUND_IN_PDF' && 'opacity-40 bg-slate-50',
                                                            it.matchStatus === 'RETURNED' && 'bg-violet-50/40 hover:bg-violet-50',
                                                            it.matchStatus === 'QTY_MISMATCH' && 'bg-red-50/40 hover:bg-red-50',
                                                            it.matchStatus === 'PRICE_MISMATCH' && 'bg-red-50/40 hover:bg-red-50',
                                                            it.matchStatus === 'BATCH_NOT_FOUND_IN_SYS' && 'bg-orange-50/40 hover:bg-orange-50',
                                                            it.matchStatus === 'NOT_FOUND_IN_SYS' && 'bg-yellow-50/40 hover:bg-yellow-50',
                                                            !['NOT_FOUND_IN_PDF', 'RETURNED', 'QTY_MISMATCH', 'PRICE_MISMATCH', 'BATCH_NOT_FOUND_IN_SYS', 'NOT_FOUND_IN_SYS'].includes(it.matchStatus)
                                                            && 'hover:bg-slate-50'
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

                        {filter !== 'ALL' && invoice.batches.every(b =>
                            b.items.every(it => it.matchStatus !== filter)
                        ) && (
                                <div className="py-8 text-center text-slate-400 text-sm">
                                    此篩選條件無資料
                                </div>
                            )}
                    </div>

                    {/* ── 系統已送出材料核對區（不變）── */}
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
                                    <div key={batch} className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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
                                                                cm.materialType === 'RETURN' && 'bg-violet-50/40 opacity-60'
                                                            )}
                                                        >
                                                            <td className="px-4 py-3 text-slate-800 font-medium">{cm.materialName}</td>
                                                            <td className="px-4 py-3 text-slate-500 text-xs">{cm.materialSpec || '—'}</td>
                                                            <td className="px-4 py-3 text-center text-slate-500 text-xs">{cm.materialUnit || '—'}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={clsx(
                                                                    'px-2 py-0.5 rounded-full text-xs font-medium',
                                                                    cm.materialType === 'PURCHASE' && 'bg-blue-50 text-blue-600',
                                                                    cm.materialType === 'LEFTOVER' && 'bg-amber-50 text-amber-600',
                                                                    cm.materialType === 'RETURN' && 'bg-violet-50 text-violet-600',
                                                                )}>
                                                                    {CASE_MATERIAL_TYPE_LABELS[cm.materialType]}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono text-slate-700">{cm.quantity}</td>
                                                            <td className="px-4 py-3 text-right font-mono text-slate-700">
                                                                {cm.unitPrice != null ? `$${cm.unitPrice.toLocaleString()}` : '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono text-slate-700">
                                                                {cm.lineCost != null ? `$${cm.lineCost.toLocaleString()}` : '—'}
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