import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWorkerOverview } from '@/services/workerService';
import type { WorkerProjectSummary, CaseWorkerRow } from '@/types/worker';
import { ArrowLeft, Printer } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function WorkerReportPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery<WorkerProjectSummary[]>({
        queryKey: ['worker-overview'],
        queryFn: getWorkerOverview,
    });

    const project = data?.find((p) => p.projectId === Number(projectId));

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>載入中...</span>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500">
                找不到此案件資料
            </div>
        );
    }

    // 取得所有不重複工人（依 workerId 排列）
    const workerMap = new Map<string, { workerId: number | null; workerName: string | null; dailyWage: number }>();
    project.workers.forEach((w) => {
        const key = w.workerId != null ? String(w.workerId) : `unnamed-${w.workerName}`;
        if (!workerMap.has(key)) {
            workerMap.set(key, { workerId: w.workerId, workerName: w.workerName, dailyWage: w.dailyWage });
        }
    });
    const workerList = Array.from(workerMap.entries()); // [key, {workerId, workerName, dailyWage}]

    // 取得所有不重複日期（排序）
    const allDates = [...new Set(project.workers.map((w) => w.workday))].sort();

    // 查詢某工人在某日期的紀錄
    const getRecord = (workerKey: string, date: string): CaseWorkerRow | undefined => {
        return project.workers.find((w) => {
            const key = w.workerId != null ? String(w.workerId) : `unnamed-${w.workerName}`;
            return key === workerKey && w.workday === date;
        });
    };

    // 每位工人的總計
    const getWorkerTotal = (workerKey: string) => {
        const rows = project.workers.filter((w) => {
            const key = w.workerId != null ? String(w.workerId) : `unnamed-${w.workerName}`;
            return key === workerKey;
        });
        const totalWage = rows.reduce((sum, r) => sum + r.dailyWage, 0);
        const totalTravel = rows.reduce((sum, r) => sum + r.travelExpenses, 0);
        return { totalWage, totalTravel, days: rows.length };
    };

    return (
        <div className="min-h-full bg-white p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 print:hidden">
                <button
                    onClick={() => navigate('/workers')}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
                >
                    <ArrowLeft size={16} />
                    返回總覽
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-primary)] text-white text-sm"
                >
                    <Printer size={14} />
                    列印 / 匯出 PDF
                </button>
            </div>

            {/* 案件標題 */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-800">{project.clientName}</h1>
                <p className="text-slate-500 text-sm mt-1">{project.projectCode}｜{project.address}</p>
            </div>

            {/* 報表表格 */}
            <div className="overflow-x-auto">
                <table className="border-collapse text-sm w-full">
                    <thead>
                        {/* 第一列：姓名 + 每人名字（橫跨工錢、天數兩欄） */}
                        <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-3 py-2 text-center font-bold w-20">姓名</th>
                            {workerList.map(([key, w]) => (
                                <th key={key} colSpan={2} className="border border-slate-300 px-3 py-2 text-center font-bold">
                                    {w.workerName || '—'}
                                </th>
                            ))}
                        </tr>
                        {/* 第二列：工錢標題（每人日薪）+ 天數 */}
                        <tr className="bg-slate-50">
                            <th className="border border-slate-300 px-3 py-2 text-center">工錢</th>
                            {workerList.map(([key, w]) => (
                                <>
                                    <th key={`${key}-wage`} className="border border-slate-300 px-3 py-2 text-center text-[var(--color-primary)]">
                                        ${w.dailyWage.toLocaleString()}
                                    </th>
                                    <th key={`${key}-days`} className="border border-slate-300 px-3 py-2 text-center text-slate-500">
                                        天數
                                    </th>
                                </>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* 每一天一列 */}
                        {allDates.map((date) => (
                            <>
                                {/* 工錢列 */}
                                <tr key={`${date}-wage`} className="hover:bg-slate-50">
                                    <td className="border border-slate-300 px-3 py-1.5 text-center font-medium">
                                        {date.slice(5).replace('-', '/')}
                                    </td>
                                    {workerList.map(([key]) => {
                                        const rec = getRecord(key, date);
                                        return (
                                            <>
                                                <td key={`${key}-wage`} className="border border-slate-300 px-3 py-1.5 text-center">
                                                    {rec ? `$${rec.dailyWage.toLocaleString()}` : ''}
                                                </td>
                                                <td key={`${key}-day`} className="border border-slate-300 px-3 py-1.5 text-center text-slate-500">
                                                    {rec ? '1' : ''}
                                                </td>
                                            </>
                                        );
                                    })}
                                </tr>
                                {/* 車資列（只有當天有人有車馬費才顯示） */}
                                {workerList.some(([key]) => {
                                    const rec = getRecord(key, date);
                                    return rec && rec.travelExpenses > 0;
                                }) && (
                                        <tr key={`${date}-travel`} className="bg-slate-50/50">
                                            <td className="border border-slate-300 px-3 py-1 text-center text-xs text-slate-400">車資</td>
                                            {workerList.map(([key]) => {
                                                const rec = getRecord(key, date);
                                                return (
                                                    <>
                                                        <td key={`${key}-travel`} colSpan={2} className="border border-slate-300 px-3 py-1 text-center text-xs text-slate-500">
                                                            {rec && rec.travelExpenses > 0 ? `$${rec.travelExpenses.toLocaleString()}` : ''}
                                                        </td>
                                                    </>
                                                );
                                            })}
                                        </tr>
                                    )}
                            </>
                        ))}

                        {/* 總額列 */}
                        <tr className="bg-yellow-50 font-bold">
                            <td className="border border-slate-300 px-3 py-2 text-center">總額</td>
                            {workerList.map(([key]) => {
                                const { totalWage, totalTravel, days } = getWorkerTotal(key);
                                return (
                                    <>
                                        <td key={`${key}-total`} className="border border-slate-300 px-3 py-2 text-center text-[var(--color-primary)]">
                                            ${(totalWage + totalTravel).toLocaleString()}
                                        </td>
                                        <td key={`${key}-totaldays`} className="border border-slate-300 px-3 py-2 text-center">
                                            {days}
                                        </td>
                                    </>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}