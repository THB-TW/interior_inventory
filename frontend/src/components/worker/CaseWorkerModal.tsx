import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Edit2, Trash2, Plus } from 'lucide-react';
import type { WorkerProjectSummary, CaseWorkerRow } from '@/types/worker';
import { getWorkers, getCaseWorkers } from '@/services/workerService';
import {
    createCaseWorker,
    updateCaseWorker,
    deleteCaseWorker,
} from '@/services/workerService';
import type { Worker } from '@/types/worker';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: WorkerProjectSummary;
}

type FormState = {
    id?: number;
    workerId: string;
    dailyWage: string;
    daysWorked: string;   // 新增
    workday: string;
    workdayEnd: string;
    travelExpenses: string;
    mealAllowance: string;
};

const emptyForm: FormState = {
    workerId: '',
    dailyWage: '',
    daysWorked: '1',      // 預設整天
    workday: '',
    workdayEnd: '',
    travelExpenses: '0',
    mealAllowance: '150',
};

export default function CaseWorkerModal({ isOpen, onClose, project }: Props) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<FormState>(emptyForm);

    const { data: workers } = useQuery<Worker[]>({
        queryKey: ['workers'],
        queryFn: getWorkers,
        enabled: isOpen,
    });

    const { data: caseWorkers, isLoading } = useQuery<CaseWorkerRow[]>({
        queryKey: ['case-workers', project.projectId],
        queryFn: () => getCaseWorkers(project.projectId),
        enabled: isOpen,
    });

    useEffect(() => {
        if (!isOpen) setForm(emptyForm);
    }, [isOpen]);

    // 當選擇師傅時，自動帶入預設日薪（日薪基準，後端會 × daysWorked）
    const handleWorkerChange = (workerId: string) => {
        const worker = workers?.find((w) => w.id === Number(workerId));
        setForm((f) => ({
            ...f,
            workerId,
            dailyWage: worker ? String(worker.dailyWage) : f.dailyWage,
        }));
    };

    const createMutation = useMutation({
        mutationFn: () =>
            createCaseWorker(project.projectId, {
                workerId: form.workerId ? Number(form.workerId) : null,
                dailyWage: Number(form.dailyWage),
                daysWorked: Number(form.daysWorked),   // 新增
                workday: form.workday,
                workdayEnd: form.workdayEnd || undefined,
                travelExpenses: Number(form.travelExpenses),
                mealAllowance: Number(form.mealAllowance),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['worker-overview'] });
            queryClient.invalidateQueries({ queryKey: ['case-workers', project.projectId] });
            setForm(emptyForm);
        },
    });

    const updateMutation = useMutation({
        mutationFn: () =>
            updateCaseWorker(project.projectId, form.id!, {
                workerId: form.workerId ? Number(form.workerId) : null,
                dailyWage: Number(form.dailyWage),
                daysWorked: Number(form.daysWorked),   // 新增
                workday: form.workday,
                workdayEnd: form.workdayEnd || undefined,
                travelExpenses: Number(form.travelExpenses),
                mealAllowance: Number(form.mealAllowance),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['worker-overview'] });
            queryClient.invalidateQueries({ queryKey: ['case-workers', project.projectId] });
            setForm(emptyForm);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteCaseWorker(project.projectId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['worker-overview'] });
            queryClient.invalidateQueries({ queryKey: ['case-workers', project.projectId] });
        },
    });

    const isSaving = createMutation.isPending || updateMutation.isPending;

    const handleEdit = (row: CaseWorkerRow) => {
        setForm({
            id: row.id,
            workerId: row.workerId ? String(row.workerId) : '',
            dailyWage: String(row.dailyWage),
            daysWorked: String(row.daysWorked),   // 新增
            workday: row.workday,
            workdayEnd: '',
            travelExpenses: String(row.travelExpenses),
            mealAllowance: String(row.mealAllowance),
        });
    };

    const handleDelete = (row: CaseWorkerRow) => {
        const name = row.workerName || '此筆紀錄';
        if (window.confirm(`確定要刪除「${name} (${row.workday})」嗎？`)) {
            deleteMutation.mutate(row.id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.dailyWage || !form.workday) {
            alert('請填寫施作日期與工錢');
            return;
        }
        form.id ? updateMutation.mutate() : createMutation.mutate();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">管理工人</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {project.projectCode}｜{project.clientName}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {isLoading && <p className="text-sm text-slate-500">載入資料中...</p>}

                        {/* 工人明細列表 */}
                        {caseWorkers && caseWorkers.length > 0 ? (
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-100 text-slate-600">
                                        <tr>
                                            <th className="px-3 py-2 text-left">工人名字</th>
                                            <th className="px-3 py-2 text-center">工作日期</th>
                                            <th className="px-3 py-2 text-center">天數</th>
                                            <th className="px-3 py-2 text-right">當天工錢</th>
                                            <th className="px-3 py-2 text-right">車馬費</th>
                                            <th className="px-3 py-2 text-right">餐費</th>
                                            <th className="px-3 py-2 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {caseWorkers.map((row) => (
                                            <tr key={row.id} className="border-t border-slate-200 hover:bg-slate-50">
                                                <td className="px-3 py-2">{row.workerName || '—'}</td>
                                                <td className="px-3 py-2 text-center">{row.workday}</td>
                                                <td className="px-3 py-2 text-center">
                                                    {row.daysWorked === 0.5 ? '半天' : '整天'}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    ${row.dailyWage.toLocaleString()}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    ${row.travelExpenses.toLocaleString()}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    ${row.mealAllowance.toLocaleString()}
                                                </td>
                                                <td className="px-3 py-2 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(row)}
                                                        className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
                                                    >
                                                        <Edit2 size={14} className="mr-1" />編輯
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(row)}
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
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                <Plus size={28} className="mb-2 text-slate-300" />
                                <p className="text-sm">此案件尚未新增任何工人紀錄。</p>
                            </div>
                        )}

                        {/* 新增 / 編輯表單 */}
                        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                {form.id ? `編輯紀錄 #${form.id}` : '新增工人紀錄'}
                            </h3>
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>

                                {/* 師傅選單 */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        師傅（選填）
                                    </label>
                                    <select
                                        value={form.workerId}
                                        onChange={(e) => handleWorkerChange(e.target.value)}
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                    >
                                        <option value="">自行填寫工錢</option>
                                        {workers?.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.nickname}（日薪 ${w.dailyWage.toLocaleString()}）
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 施作天數 */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        施作天數
                                    </label>
                                    <select
                                        value={form.daysWorked}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setForm((f) => ({
                                                ...f,
                                                daysWorked: val,
                                                mealAllowance: val === '0.5' ? '100' : '150'
                                            }));
                                        }}
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                    >
                                        <option value="1">整天（1 天）</option>
                                        <option value="0.5">半天（0.5 天）</option>
                                    </select>
                                </div>

                                {/* 施作日期（起） */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        施作日期（起）
                                    </label>
                                    <input
                                        type="date"
                                        value={form.workday}
                                        onChange={(e) => setForm((f) => ({ ...f, workday: e.target.value }))}
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                    />
                                </div>

                                {/* 施作日期（迄），僅新增時顯示 */}
                                {!form.id && (
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            施作日期（迄）
                                            <span className="ml-1 text-slate-400 font-normal">不填則只記一天</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={form.workdayEnd}
                                            min={form.workday || undefined}
                                            onChange={(e) => setForm((f) => ({ ...f, workdayEnd: e.target.value }))}
                                            className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                        />
                                    </div>
                                )}

                                {/* 日薪基準 */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        日薪基準（元）
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.dailyWage}
                                        onChange={(e) => setForm((f) => ({ ...f, dailyWage: e.target.value }))}
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                        placeholder="例如：3000"
                                    />
                                    {form.dailyWage && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            實際工錢 = ${(Number(form.dailyWage) * Number(form.daysWorked)).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                {/* 車馬費 */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        車馬費（元）
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.travelExpenses}
                                        onChange={(e) => setForm((f) => ({ ...f, travelExpenses: e.target.value }))}
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                        placeholder="例如：200"
                                    />
                                </div>

                                {/* 餐費 */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        餐費（元）
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.mealAllowance}
                                        onChange={(e) => setForm((f) => ({ ...f, mealAllowance: e.target.value }))}
                                        className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                                        placeholder="例如：150"
                                    />
                                </div>

                                {/* 操作按鈕 */}
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
                                        {isSaving ? '儲存中...' : form.id ? '儲存修改' : '新增紀錄'}
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