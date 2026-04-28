import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';
import type { MaterialResponse } from '@/types/material';
import {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
} from '@/services/materialService';

interface MaterialManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FormState = {
    id?: number; // 有值代表在編輯
    name: string;
    unit: string;
    description: string;
    defaultPrice: string; // 用字串收，方便 input 綁定
    isActive: boolean;
};

const emptyForm: FormState = {
    name: '',
    unit: '',
    description: '',
    defaultPrice: '',
    isActive: true,
};

export default function MaterialManagementModal({
    isOpen,
    onClose,
}: MaterialManagementModalProps) {
    const queryClient = useQueryClient();

    const { data: materials, isLoading, error } = useQuery<MaterialResponse[]>({
        queryKey: ['materials'],
        queryFn: getMaterials,
        enabled: isOpen, // 只有開啟時才載資料
    });

    const [form, setForm] = useState<FormState>(emptyForm);

    // 關掉時順便清空表單
    useEffect(() => {
        if (!isOpen) {
            setForm(emptyForm);
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: () =>
            createMaterial({
                name: form.name.trim(),
                unit: form.unit.trim(),
                description: form.description.trim() || undefined,
                defaultPrice: form.defaultPrice ? Number(form.defaultPrice) : undefined,
                isActive: form.isActive,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['materials'] });
            setForm(emptyForm);
        },
        onError: (error: Error) => {
            alert(error.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: () =>
            updateMaterial(form.id!, {
                name: form.name.trim(),
                unit: form.unit.trim(),
                description: form.description.trim() || undefined,
                defaultPrice: form.defaultPrice ? Number(form.defaultPrice) : undefined,
                isActive: form.isActive,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['materials'] });
            setForm(emptyForm);
        },
        onError: (error: Error) => {
            alert(error.message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteMaterial(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['materials'] });
        },
    });

    const isSaving = createMutation.isPending || updateMutation.isPending;

    const handleEdit = (m: MaterialResponse) => {
        setForm({
            id: m.id,
            name: m.name,
            unit: m.unit,
            description: m.description || '',
            defaultPrice: m.defaultPrice != null ? String(m.defaultPrice) : '',
            isActive: m.isActive,
        });
    };

    const handleDelete = (m: MaterialResponse) => {
        if (window.confirm(`確定要刪除材料「${m.name}」嗎？`)) {
            deleteMutation.mutate(m.id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.unit.trim()) {
            alert('請輸入材料名稱與單位');
            return;
        }
        if (form.id) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* 背景遮罩 */}
            <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={onClose}
            />

            {/* Modal 本體 */}
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800">材料管理</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {/* 錯誤 / 載入狀態 */}
                        {isLoading && (
                            <p className="text-sm text-slate-500">載入材料資料中...</p>
                        )}
                        {error && (
                            <p className="text-sm text-red-600">
                                無法取得材料資料：{error instanceof Error ? error.message : '未知錯誤'}
                            </p>
                        )}

                        {/* 材料列表 */}
                        {materials && materials.length > 0 && (
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-100 text-slate-600">
                                        <tr>
                                            <th className="px-3 py-2 text-left">名稱</th>
                                            <th className="px-3 py-2 text-left">單位</th>
                                            <th className="px-3 py-2 text-left">預設單價</th>
                                            <th className="px-3 py-2 text-left">啟用</th>
                                            <th className="px-3 py-2 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materials.map((m) => (
                                            <tr
                                                key={m.id}
                                                className="border-t border-slate-200 hover:bg-slate-50"
                                            >
                                                <td className="px-3 py-2">{m.name}</td>
                                                <td className="px-3 py-2">{m.unit}</td>
                                                <td className="px-3 py-2">
                                                    {m.defaultPrice != null ? m.defaultPrice : '—'}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span
                                                        className={
                                                            m.isActive
                                                                ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200'
                                                                : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500 border border-slate-200'
                                                        }
                                                    >
                                                        {m.isActive ? '啟用' : '停用'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(m)}
                                                        className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
                                                    >
                                                        <Edit2 size={14} className="mr-1" />
                                                        編輯
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(m)}
                                                        className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} className="mr-1" />
                                                        刪除
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* 新增 / 編輯表單 */}
                        <div className="mt-2 border border-slate-200 rounded-lg p-4 bg-slate-50">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                {form.id ? `編輯材料 #${form.id}` : '新增材料'}
                            </h3>
                            <form
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                onSubmit={handleSubmit}
                            >
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        名稱
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, name: e.target.value }))
                                        }
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                        placeholder="例如：木心板 2*8 中興"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        單位
                                    </label>
                                    <input
                                        type="text"
                                        value={form.unit}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, unit: e.target.value }))
                                        }
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                        placeholder="支 / 片 / 坪..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        說明
                                    </label>
                                    <input
                                        type="text"
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, description: e.target.value }))
                                        }
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                        placeholder="例如：常用角材，綠建材等級"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        預設單價
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.defaultPrice}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, defaultPrice: e.target.value }))
                                        }
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                        placeholder="例如：335"
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-5">
                                    <input
                                        id="isActive"
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, isActive: e.target.checked }))
                                        }
                                        className="h-4 w-4 text-[var(--color-primary)] border-slate-300 rounded"
                                    />
                                    <label
                                        htmlFor="isActive"
                                        className="text-xs font-medium text-slate-600"
                                    >
                                        啟用
                                    </label>
                                </div>

                                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                                    {form.id && (
                                        <button
                                            type="button"
                                            onClick={() => setForm(emptyForm)}
                                            className="px-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100"
                                        >
                                            取消編輯
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-1.5 text-xs rounded-md bg-[var(--color-primary)] text-white hover:bg-opacity-90 disabled:opacity-50"
                                    >
                                        {isSaving
                                            ? '儲存中...'
                                            : form.id
                                                ? '儲存修改'
                                                : '新增材料'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}