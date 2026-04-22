// frontend/src/components/quote/OrderSheetModal.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Copy, Check, Truck } from 'lucide-react';
import { confirmOrderBatch } from '@/services/quoteService';
import type { QuoteProjectUsage, QuoteMaterialLineResponse } from '@/types/quote';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: QuoteProjectUsage;
}

export default function OrderSheetModal({ isOpen, onClose, project }: Props) {
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);
    const [confirmStep, setConfirmStep] = useState(false); // ★ 二次確認 state

    if (!isOpen) return null;

    // ★ 取當前批次的材料
    const currentBatchRows: QuoteMaterialLineResponse[] = project.quotation.filter(
        (r) => r.orderBatch === project.orderBatch,
    );

    const purchases = currentBatchRows.filter((r) => r.materialType === 'PURCHASE');
    const returns = currentBatchRows.filter((r) => r.materialType === 'RETURN');

    // ★ 生成叫貨單純文字
    const generateText = (): string => {
        const lines: string[] = [
            `【叫貨單】第 ${project.orderBatch} 批`,
            `案號：${project.projectCode}`,
            `地址：${project.address}`,
            `備註：${project.description || '無'}`,
            '',
            '▌進貨材料',
        ];

        if (purchases.length === 0) {
            lines.push('  （無）');
        } else {
            purchases.forEach((p) => lines.push(`  - ${p.materialName}  ${p.quantity} ${p.materialUnit}`));
        }

        lines.push('');
        lines.push('▌退貨材料');

        if (returns.length === 0) {
            lines.push('  （無）');
        } else {
            returns.forEach((r) => lines.push(`  - ${r.materialName}  ${r.quantity} ${r.materialUnit}`));
        }

        return lines.join('\n');
    };

    const orderText = generateText();

    // 複製到剪貼簿
    const handleCopy = async () => {
        await navigator.clipboard.writeText(orderText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 確定出貨 — 讓後端將 currentOrderBatch +1
    const confirmMutation = useMutation({
        mutationFn: () => confirmOrderBatch(project.projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quote-overview'] });
            setConfirmStep(false);
            onClose();
        },
    });

    const isEmpty = currentBatchRows.length === 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">
                            叫貨單 — {project.projectCode}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {project.clientName}
                            <span className="ml-2 px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                                第 {project.orderBatch} 批
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="關閉"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-auto p-6 space-y-4">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <p className="text-sm">本批次尚未新增任何材料。</p>
                            <p className="text-xs mt-1">請先在「管理用料」新增材料後再生成叫貨單。</p>
                        </div>
                    ) : (
                        <>
                            {/* 純文字預覽 */}
                            <pre className="whitespace-pre-wrap text-sm bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700 leading-relaxed font-mono">
                                {orderText}
                            </pre>

                            {/* 進貨 / 退貨明細小表 */}
                            {[
                                { label: '進貨', rows: purchases, chipCls: 'text-blue-700 bg-blue-50' },
                                { label: '退貨', rows: returns, chipCls: 'text-orange-700 bg-orange-50' },
                            ].map(({ label, rows, chipCls }) =>
                                rows.length > 0 && (
                                    <div key={label}>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2 ${chipCls}`}>
                                            {label}
                                        </span>
                                        <table className="min-w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                                            <thead className="bg-slate-100 text-slate-500">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">材料名稱</th>
                                                    <th className="px-3 py-2 text-right">數量</th>
                                                    <th className="px-3 py-2 text-right">單位</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((r) => (
                                                    <tr key={r.caseMaterialId} className="border-t border-slate-200">
                                                        <td className="px-3 py-2">{r.materialName}</td>
                                                        <td className="px-3 py-2 text-right font-medium">{r.quantity}</td>
                                                        <td className="px-3 py-2 text-right text-slate-500">{r.materialUnit}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                    {/* 二次確認出貨提示 */}
                    {confirmStep && (
                        <div className="mb-3 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
                            <span>確認出貨後批次將 +1，本批次無法再新增材料。</span>
                            <div className="flex items-center gap-2 ml-4 shrink-0">
                                <button
                                    onClick={() => confirmMutation.mutate()}
                                    disabled={confirmMutation.isPending}
                                    className="px-3 py-1 bg-amber-600 text-white rounded-md text-xs hover:bg-amber-700 transition-colors disabled:opacity-50"
                                >
                                    {confirmMutation.isPending ? '處理中…' : '確認'}
                                </button>
                                <button
                                    onClick={() => setConfirmStep(false)}
                                    className="px-3 py-1 text-amber-700 hover:underline text-xs"
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        {/* 複製按鈕 */}
                        <button
                            onClick={handleCopy}
                            disabled={isEmpty}
                            className="inline-flex items-center gap-2 px-4 py-1.5 border border-slate-300 text-sm text-slate-600 rounded-md hover:bg-white transition-colors disabled:opacity-40"
                        >
                            {copied
                                ? <Check size={14} className="text-green-600" />
                                : <Copy size={14} />
                            }
                            {copied ? '已複製' : '複製文字'}
                        </button>

                        {/* 確定出貨按鈕 */}
                        {!confirmStep && (
                            <button
                                onClick={() => setConfirmStep(true)}
                                disabled={isEmpty}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-primary)] text-white text-sm rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                <Truck size={14} />
                                確定出貨
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}