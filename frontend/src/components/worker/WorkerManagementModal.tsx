import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Edit2, Trash2 } from 'lucide-react';
import type { Worker } from '@/types/worker';
import {
    getWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
} from '@/services/workerService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type FormState = {
    id?: number;
    nickname: string;
    dailyWage: string;
};

const emptyForm: FormState = { nickname: '', dailyWage: '' };

export default function WorkerManagementModal({ isOpen, onClose }: Props) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<FormState>(emptyForm);

    const { data: workers, isLoading, error } = useQuery<Worker[]>({
        queryKey: ['workers'],
        queryFn: getWorkers,
        enabled: isOpen,
    });

    useEffect(() => {
        if (!isOpen) setForm(emptyForm);
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: () =>
            createWorker({ nickname: form.nickname.trim(), dailyWage: Number(form.dailyWage) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            setForm(emptyForm);
        },
    });

    const updateMutation = useMutation({
        mutationFn: () =>
            updateWorker(form.id!, { nickname: form.nickname.trim(), dailyWage: Number(form.dailyWage) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            setForm(emptyForm);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteWorker(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
    });

    const isSaving = createMutation.isPending || updateMutation.isPending;

    const handleEdit = (w: Worker) =>
        setForm({ id: w.id, nickname: w.nickname, dailyWage: String(w.dailyWage) });

    const handleDelete = (w: Worker) => {
        if (window.confirm(`確定要刪除師傅「${w.nickname}」嗎？`)) {
            deleteMutation.mutate(w.id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nickname.trim() || !form.dailyWage) {
            alert('請輸入師傅名稱與日薪');
            return;
        }
        form.id ? updateMutation.mutate() : createMutation.mutate();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800">師傅管理</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {isLoading && <p className="text-sm text-slate-500">載入師傅資料中...</p>}
                        {error && (
                            <p className="text-sm text-red-600">
                                無法取得師傅資料：{error instanceof Error ? error.message : '未知錯誤'}
                            </p>
                        )}

                        {/* 師傅列表 */}
                        {workers && workers.length > 0 && (
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-100 text-slate-600">
                                        <tr>
                                            <th className="px-3 py-2 text-left">姓名</th>
                                            <th className="px-3 py-2 text-right">預設日薪</th>
                                            <th className="px-3 py-2 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workers.map((w) => (
                                            <tr key={w.id} className="border-t border-slate-200 hover:bg-slate-50">
                                                <td className="px-3 py-2">{w.nickname}</td>
                                                <td className="px-3 py-2 text-right">
                                                    ${w.dailyWage.toLocaleString()}
                                                </td>
                                                <td className="px-3 py-2 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(w)}
                                                        className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
                                                    >
                                                        <Edit2 size={14} className="mr-1" />編輯
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(w)}
                                                        className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} className="mr-1" />刪除
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* 新增 / 編輯表單 */}
                        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                {form.id ? `編輯師傅 #${form.id}` : '新增師傅'}
                            </h3>
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">姓名</label>
                                    <input
                                        type="text"
                                        value={form.nickname}
                                        onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                        placeholder="例如：王師傅"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">預設日薪（元）</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.dailyWage}
                                        onChange={(e) => setForm((f) => ({ ...f, dailyWage: e.target.value }))}
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                        placeholder="例如：3000"
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-2">
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
                                        {isSaving ? '儲存中...' : form.id ? '儲存修改' : '新增師傅'}
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