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

// 類型選單只開放進貨 / 退貨，排除剩料
const ALLOWED_TYPES = ['PURCHASE', 'RETURN'] as const;

export default function CaseMaterialModal({ isOpen, onClose, project }: Props) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<QuoteMaterialPayload>(EMPTY_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    // 材料主檔下拉選單
    const { data: materials = [] } = useQuery({
        queryKey: ['materials'],
        queryFn: getMaterials,
    });

    // 每筆 CaseMaterial 明細（不 aggregate）
    const { data: rows = [], isLoading: linesLoading } = useQuery({
        queryKey: ['case-material-lines', project.projectId],
        queryFn: () => getCaseMaterialLines(project.projectId),
        enabled: isOpen,
    });

    // 選到材料時自動帶入 defaultPrice
    useEffect(() => {
        if (form.materialId) {
            const mat = materials.find((m) => m.id === form.materialId);
            if (mat?.defaultPrice != null) {
                setForm((f) => ({ ...f, unitPrice: mat.defaultPrice ?? undefined }));
            }
        }
    }, [form.materialId, materials]);

    // 關閉時重置表單狀態
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

    // 新增
    const createMutation = useMutation({
        mutationFn: (payload: QuoteMaterialPayload) =>
            createProjectMaterial(project.projectId, payload),
        onSuccess: () => {
            invalidate();
            setForm(EMPTY_FORM);
        },
    });

    // 更新
    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: QuoteMaterialPayload }) =>
            updateProjectMaterial(project.projectId, id, payload),
        onSuccess: () => {
            invalidate();
            setEditingId(null);
            setForm(EMPTY_FORM);
        },
    });

    // 刪除
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">
                            管理用料 — {project.projectCode}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">{project.clientName}</p>
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

                    {/* 每筆 CaseMaterial 明細列表 */}
                    {linesLoading ? (
                        <div className="flex items-center justify-center py-8 text-slate-400">
                            <Loader2 size={20} className="animate-spin mr-2" />
                            <span className="text-sm">載入中…</span>
                        </div>
                    ) : rows.length > 0 ? (
                        <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                            <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="px-3 py-2 text-left">材料名稱</th>
                                    <th className="px-3 py-2 text-left">類型</th>
                                    <th className="px-3 py-2 text-right">數量</th>
                                    <th className="px-3 py-2 text-right">單價</th>
                                    <th className="px-3 py-2 text-right">小計</th>
                                    <th className="px-3 py-2 text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr
                                        key={row.caseMaterialId}
                                        className={`border-t border-slate-200 transition-colors ${editingId === row.caseMaterialId
                                            ? 'bg-teal-50'
                                            : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <td className="px-3 py-2 font-medium">{row.materialName}</td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${row.materialType === 'PURCHASE'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : row.materialType === 'RETURN'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {CASE_MATERIAL_TYPE_LABELS[row.materialType]}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right">{row.quantity}</td>
                                        <td className="px-3 py-2 text-right text-slate-600">
                                            {row.unitPrice != null
                                                ? row.unitPrice.toLocaleString()
                                                : '—'}
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium">
                                            {row.lineCost != null
                                                ? row.lineCost.toLocaleString()
                                                : '—'}
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
                                                            onClick={() =>
                                                                deleteMutation.mutate(row.caseMaterialId)
                                                            }
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
                                                        onClick={() =>
                                                            setDeleteTargetId(row.caseMaterialId)
                                                        }
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

                        <div className="grid grid-cols-2 gap-3">
                            {/* 材料名稱下拉（連結 materials 主檔） */}
                            <div className="col-span-2">
                                <label className="block text-xs text-slate-500 mb-1">
                                    材料名稱
                                </label>
                                <select
                                    value={form.materialId || ''}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            materialId: Number(e.target.value),
                                            unitPrice: undefined, // 換材料時先清空，讓 useEffect 重新帶入
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

                            {/* 用料類型：只能選進貨 / 退貨 */}
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">
                                    用料類型
                                </label>
                                <select
                                    value={form.materialType}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            materialType: e.target
                                                .value as QuoteMaterialPayload['materialType'],
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

                            {/* 數量 */}
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">
                                    數量
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={form.quantity}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            quantity: Number(e.target.value),
                                        }))
                                    }
                                    required
                                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>

                            {/* 單價（選填，自動帶入 defaultPrice） */}
                            <div className="col-span-2">
                                <label className="block text-xs text-slate-500 mb-1">
                                    單價
                                    <span className="ml-1 text-slate-400">
                                        （選填，自動帶入材料預設單價）
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={form.unitPrice ?? ''}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            unitPrice: e.target.value
                                                ? Number(e.target.value)
                                                : undefined,
                                        }))
                                    }
                                    placeholder="留空則不計算小計"
                                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>
                        </div>

                        {/* 按鈕列 */}
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