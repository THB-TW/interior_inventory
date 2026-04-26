import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, CheckCircle, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { supplierInvoiceService } from '@/services/supplierInvoiceService';
import StatusBadge from '@/components/common/StatusBadge';
import type { InvoiceCompareResult, InvoiceCompareItem } from '@/types/finance';

interface Props {
    projectId: number;
}

function fmt(n: number | null) {
    if (n == null) return '—';
    return `$${n.toLocaleString('zh-TW')}`;
}

function MatchRow({ item }: { item: InvoiceCompareItem }) {
    const isMismatch = item.matchStatus === 'QTY_MISMATCH' || item.matchStatus === 'PRICE_MISMATCH';
    return (
        <tr className={clsx('border-b border-slate-100 hover:bg-slate-50 transition-colors', isMismatch && 'bg-red-50 hover:bg-red-100')}>
            <td className="px-4 py-3 font-medium text-slate-800">{item.materialName}</td>
            <td className="px-4 py-3 text-slate-500">{item.specification ?? '—'}</td>
            <td className="px-4 py-3 text-right tabular-nums">{item.invoiceQty ?? '—'}</td>
            <td className={clsx('px-4 py-3 text-right tabular-nums', item.matchStatus === 'QTY_MISMATCH' && 'text-red-600 font-semibold')}>
                {item.systemQty ?? '—'}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">{fmt(item.invoiceUnitPrice)}</td>
            <td className={clsx('px-4 py-3 text-right tabular-nums', item.matchStatus === 'PRICE_MISMATCH' && 'text-red-600 font-semibold')}>
                {fmt(item.systemUnitPrice)}
            </td>
            <td className="px-4 py-3 text-center">
                <StatusBadge status={item.matchStatus} />
            </td>
        </tr>
    );
}

export default function SupplierInvoiceTab({ projectId }: Props) {
    const [compareResult, setCompareResult] = useState<InvoiceCompareResult | null>(null);
    const queryClient = useQueryClient();

    const { data: invoices = [], isLoading: listLoading } = useQuery({
        queryKey: ['supplier-invoices', projectId],
        queryFn: () => supplierInvoiceService.getByProject(projectId),
    });

    const uploadMutation = useMutation({
        mutationFn: (file: File) => supplierInvoiceService.upload(projectId, file),
        onSuccess: (data) => setCompareResult(data),
    });

    const confirmMutation = useMutation({
        mutationFn: () => supplierInvoiceService.confirm(compareResult!.tempInvoiceId, projectId),
        onSuccess: () => {
            setCompareResult(null);
            queryClient.invalidateQueries({ queryKey: ['supplier-invoices', projectId] });
        },
    });

    const hasMismatch = (compareResult?.mismatchCount ?? 0) > 0;

    return (
        <div className="flex flex-col gap-6">

            {/* ── 上傳區 ── */}
            <label className={clsx(
                'flex flex-col items-center gap-3 cursor-pointer',
                'border-2 border-dashed rounded-xl p-8 transition-colors',
                'text-slate-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
                uploadMutation.isPending && 'opacity-50 pointer-events-none'
            )}>
                {uploadMutation.isPending
                    ? <Loader2 size={28} className="animate-spin" />
                    : <Upload size={28} />
                }
                <span className="text-sm font-medium">
                    {uploadMutation.isPending ? 'PDF 解析中，請稍候...' : '點擊上傳建材商 PDF 對帳單'}
                </span>
                <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    disabled={uploadMutation.isPending}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadMutation.mutate(file);
                        e.target.value = '';
                    }}
                />
            </label>

            {uploadMutation.isError && (
                <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100">
                    {uploadMutation.error instanceof Error ? uploadMutation.error.message : '上傳失敗，請確認 PDF 格式正確'}
                </div>
            )}

            {/* ── 比對結果 ── */}
            {compareResult && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-sm text-slate-700">
                            <span className="font-semibold">{compareResult.supplierName}</span>
                            <span className="mx-2 text-slate-300">|</span>
                            <span className="font-mono">{compareResult.invoiceNumber}</span>
                            <span className="mx-2 text-slate-300">|</span>
                            {compareResult.invoiceDate}
                            {compareResult.totalAmount != null && (
                                <><span className="mx-2 text-slate-300">|</span>總計 {fmt(compareResult.totalAmount)}</>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium shrink-0">
                            <span className="text-emerald-600">✅ 吻合 {compareResult.okCount}</span>
                            <span className="text-red-500">🔴 異常 {compareResult.mismatchCount}</span>
                            <span className="text-yellow-600">🟡 未登錄 {compareResult.notFoundCount}</span>
                        </div>
                    </div>

                    {/* 明細表格 */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                                <tr>
                                    {['品名', '規格', '對帳單 數量', '系統 數量', '對帳單 單價', '系統 單價', '狀態'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {compareResult.items.map((item, i) => (
                                    <MatchRow key={i} item={item} />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 確認按鈕列 */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-4">
                        {hasMismatch && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600">
                                <AlertTriangle size={14} />
                                含異常項目，確認後仍會正式寫入
                            </div>
                        )}
                        <button
                            onClick={() => setCompareResult(null)}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={() => confirmMutation.mutate()}
                            disabled={confirmMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-50 text-white rounded-lg transition-opacity"
                        >
                            {confirmMutation.isPending
                                ? <Loader2 size={15} className="animate-spin" />
                                : <CheckCircle size={15} />
                            }
                            人工確認，正式寫入
                        </button>
                    </div>
                </div>
            )}

            {/* ── 歷史對帳單列表 ── */}
            {listLoading ? (
                <div className="flex items-center justify-center h-24 text-slate-400 gap-2">
                    <Loader2 size={20} className="animate-spin text-[var(--color-primary)]" />
                    <span className="text-sm">載入對帳單紀錄...</span>
                </div>
            ) : invoices.length > 0 && (
                <div>
                    <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">歷史對帳單</p>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {invoices.map((inv, i) => (
                            <div
                                key={inv.id}
                                className={clsx(
                                    'flex items-center justify-between px-5 py-3 text-sm hover:bg-slate-50 transition-colors',
                                    i !== 0 && 'border-t border-slate-100'
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <FileText size={16} className="text-slate-400 shrink-0" />
                                    <span className="font-medium text-slate-800 truncate">{inv.supplierName}</span>
                                    <span className="font-mono text-slate-400 text-xs shrink-0">{inv.invoiceNumber}</span>
                                    <span className="text-slate-400 text-xs shrink-0">
                                        {dayjs(inv.invoiceDate).format('YYYY/MM/DD')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {inv.totalAmount != null && (
                                        <span className="text-slate-600 tabular-nums">{fmt(inv.totalAmount)}</span>
                                    )}
                                    <StatusBadge status={inv.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}