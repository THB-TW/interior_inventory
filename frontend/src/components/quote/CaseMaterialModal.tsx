// frontend/src/components/quote/CaseMaterialModal.tsx

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { getMaterials } from '@/services/materialService';
import {
    createProjectMaterial,
    updateProjectMaterial,
    deleteProjectMaterial,
    getCaseMaterialLines,
    type QuoteMaterialPayload,
} from '@/services/quoteService';
import type { QuoteProjectUsage, QuoteMaterialLineResponse } from '@/types/quote';
import { CASE_MATERIAL_TYPE_LABELS } from '@/types/quote';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: QuoteProjectUsage;
}

const EMPTY_FORM: QuoteMaterialPayload = {
    materialId: 0,
    materialType: 'PURCHASE',
    quantity: 1,
};

const ALLOWED_TYPES = ['PURCHASE', 'RETURN'] as const;

export default function CaseMaterialModal({ isOpen, onClose, project }: Props) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<QuoteMaterialPayload>(EMPTY_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const { data: materials = [] } = useQuery({
        queryKey: ['materials'],
        queryFn: getMaterials,
    });

    const { data: rows = [], isLoading: linesLoading } = useQuery({
        queryKey: ['case-material-lines', project.projectId],
        queryFn: () => getCaseMaterialLines(project.projectId),
        enabled: isOpen,
    });

    useEffect(() => {
        if (form.materialId) {
            const mat = materials.find((m) => m.id === form.materialId);
            if (mat?.defaultPrice != null) {
                setForm((f) => ({ ...f, unitPrice: mat.defaultPrice ?? undefined }));
            }
        }
    }, [form.materialId, materials]);

    const handleClose = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setDeleteTargetId(null);
        onClose();
    };

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['case-material-lines', project.projectId] });
        queryClient.invalidateQueries({ queryKey: ['quote-overview'] });
    };

    const createMutation = useMutation({
        mutationFn: (payload: QuoteMaterialPayload) =>
            createProjectMaterial(project.projectId, payload),
        onSuccess: () => {
            invalidate();
            setForm(EMPTY_FORM);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: QuoteMaterialPayload }) =>
            updateProjectMaterial(project.projectId, id, payload),
        onSuccess: () => {
            invalidate();
            setEditingId(null);
            setForm(EMPTY_FORM);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (caseMaterialId: number) =>
            deleteProjectMaterial(project.projectId, caseMaterialId),
        onSuccess: () => {
            invalidate();
            setDeleteTargetId(null);
        },
    });

    if (!isOpen) return null;

    const isSubmitting =
        createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.materialId || !form.quantity) return;
        if (editingId !== null) {
            updateMutation.mutate({ id: editingId, payload: form });
        } else {
            createMutation.mutate(form);
        }
    };

    const handleEdit = (row: QuoteMaterialLineResponse) => {
        setEditingId(row.caseMaterialId);
        setDeleteTargetId(null);
        setForm({
            materialId: row.materialId,
            materialType: row.materialType as QuoteMaterialPayload['materialType'],
            quantity: row.quantity,
            unitPrice: row.unitPrice ?? undefined,
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    // ★ 依 orderBatch 分組，方便顯示分隔線
    const groupedByBatch = rows.reduce<Record<number, QuoteMaterialLineResponse[]>>(
        (acc, row) => {
            const batch = row.orderBatch;
            if (!acc[batch]) acc[batch] = [];
            acc[batch].push(row);
            return acc;
        },
        {},
    );
    const sortedBatches = Object.keys(groupedByBatch)
        .map(Number)
        .sort((a, b) => a - b);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">
                            管理用料 — {project.projectCode}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {project.clientName}
                            {/* ★ 顯示當前叫貨批次 */}
                            <span className="ml-2 px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                                目前第 {project.orderBatch} 批
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="關閉"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Content ── */}
                <div className="flex-1 overflow-auto p-6 space-y-6">

                    {/* 材料明細列表 */}
                    {linesLoading ? (
                        <div className="flex items-center justify-center py-8 text-slate-400">
                            <Loader2 size={20} className="animate-spin mr-2" />
                            <span className="text-sm">載入中…</span>
                        </div>
                    ) : rows.length > 0 ? (
                        <div className="space-y-4">
                            {sortedBatches.map((batch) => (
                                <div key={batch}>
                                    {/* ★ 批次分隔標題 */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${batch === project.orderBatch
                                            ? 'bg-teal-100 text-teal-700'
                                            : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            第 {batch} 批
                                        </span>
                                        {batch === project.orderBatch && (
                                            <span className="text-xs text-teal-600">（本次叫貨）</span>
                                        )}
                                        <span className="text-xs text-slate-400">
                                            建立：{new Date(groupedByBatch[batch][0].createdAt).toLocaleDateString('zh-TW')}
                                        </span>
                                    </div>

                                    <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                                        <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
                                            <tr>
                                                <th className="px-3 py-2 text-left">材料名稱</th>
                                                <th className="px-3 py-2 text-left">類型</th>
                                                <th className="px-3 py-2 text-right">數量</th>
                                                <th className="px-3 py-2 text-right">單價</th>
                                                <th className="px-3 py-2 text-right">小計</th>
                                                {/* ★ 建立時間欄 */}
                                                <th className="px-3 py-2 text-center">建立時間</th>
                                                <th className="px-3 py-2 text-center">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedByBatch[batch].map((row) => (
                                                <tr
                                                    key={row.caseMaterialId}
                                                    className={`border-t border-slate-200 transition-colors ${editingId === row.caseMaterialId
                                                        ? 'bg-teal-50'
                                                        : 'hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <td className="px-3 py-2 font-medium">{row.materialName}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${row.materialType === 'PURCHASE'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : row.materialType === 'RETURN'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            {CASE_MATERIAL_TYPE_LABELS[row.materialType]}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-right">{row.quantity}</td>
                                                    <td className="px-3 py-2 text-right text-slate-600">
                                                        {row.unitPrice != null ? row.unitPrice.toLocaleString() : '—'}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">
                                                        {row.lineCost != null ? row.lineCost.toLocaleString() : '—'}
                                                    </td>
                                                    {/* ★ 建立時間 */}
                                                    <td className="px-3 py-2 text-center text-xs text-slate-400">
                                                        {new Date(row.createdAt).toLocaleDateString('zh-TW')}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleEdit(row)}
                                                                className="text-slate-400 hover:text-[var(--color-primary)] transition-colors"
                                                                aria-label="編輯"
                                                                disabled={isSubmitting}
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            {deleteTargetId === row.caseMaterialId ? (
                                                                <div className="flex items-center gap-1 text-xs">
                                                                    <button
                                                                        onClick={() => deleteMutation.mutate(row.caseMaterialId)}
                                                                        className="text-red-600 font-medium hover:underline"
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        確認
                                                                    </button>
                                                                    <span className="text-slate-300">|</span>
                                                                    <button
                                                                        onClick={() => setDeleteTargetId(null)}
                                                                        className="text-slate-400 hover:underline"
                                                                    >
                                                                        取消
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setDeleteTargetId(row.caseMaterialId)}
                                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                                    aria-label="刪除"
                                                                    disabled={isSubmitting}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <p className="text-sm">此案件目前尚未設定用料。</p>
                            <p className="text-xs mt-1">請使用下方表單新增第一筆用料。</p>
                        </div>
                    )}

                    {/* ── 新增 / 編輯表單 ── */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-3 border-t border-slate-200 pt-5"
                    >
                        <h3 className="text-sm font-medium text-slate-700">
                            {editingId !== null ? '✏️ 編輯用料' : '＋ 新增用料'}
                        </h3>
                        {/* ★ 提示新增後會被分到哪一批 */}
                        {editingId === null && (
                            <p className="text-xs text-slate-400">
                                新增的用料將自動歸入第{' '}
                                <span className="font-medium text-teal-600">
                                    {project.orderBatch}
                                </span>{' '}
                                批叫貨。
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs text-slate-500 mb-1">材料名稱</label>
                                <select
                                    value={form.materialId || ''}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            materialId: Number(e.target.value),
                                            unitPrice: undefined,
                                        }))
                                    }
                                    required
                                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                >
                                    <option value="">請選擇材料</option>
                                    {materials
                                        .filter((m) => m.isActive)
                                        .map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name}（{m.unit}）
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-500 mb-1">用料類型</label>
                                <select
                                    value={form.materialType}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            materialType: e.target.value as QuoteMaterialPayload['materialType'],
                                        }))
                                    }
                                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                >
                                    {ALLOWED_TYPES.map((key) => (
                                        <option key={key} value={key}>
                                            {CASE_MATERIAL_TYPE_LABELS[key]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-500 mb-1">數量</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={form.quantity}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
                                    }
                                    required
                                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs text-slate-500 mb-1">
                                    單價
                                    <span className="ml-1 text-slate-400">（選填，自動帶入材料預設單價）</span>
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={form.unitPrice ?? ''}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            unitPrice: e.target.value ? Number(e.target.value) : undefined,
                                        }))
                                    }
                                    placeholder="留空則不計算小計"
                                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                            {editingId !== null && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                >
                                    取消編輯
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting || !form.materialId}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-primary)] text-white text-sm rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : editingId !== null ? (
                                    <Pencil size={14} />
                                ) : (
                                    <Plus size={14} />
                                )}
                                {editingId !== null ? '儲存修改' : '新增用料'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}