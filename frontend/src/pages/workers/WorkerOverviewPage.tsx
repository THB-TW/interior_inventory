import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWorkerOverview } from '@/services/workerService';
import type { WorkerProjectSummary } from '@/types/worker';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/types/project';
import { Loader2, ChevronDown, ChevronUp, Users, Search, HardHat } from 'lucide-react';
import WorkerManagementModal from '@/components/worker/WorkerManagementModal';
import CaseWorkerModal from '@/components/worker/CaseWorkerModal';

export default function WorkerOverviewPage() {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isWorkerMgmtOpen, setIsWorkerMgmtOpen] = useState(false);
    const [caseWorkerProject, setCaseWorkerProject] = useState<WorkerProjectSummary | null>(null);

    const { data, isLoading, error } = useQuery<WorkerProjectSummary[]>({
        queryKey: ['worker-overview'],
        queryFn: getWorkerOverview,
    });

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>載入師傅工作資料中...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center text-red-600">
                無法取得師傅資料：{error instanceof Error ? error.message : '未知錯誤'}
            </div>
        );
    }

    const workerList = data || [];

    if (workerList.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <HardHat size={40} className="mb-3 text-slate-300" />
                <p>目前沒有符合條件的案件（已確認 / 施工中 / 驗收中 / 已結案）。</p>
            </div>
        );
    }

    // 前端 filter：案號、客戶名稱、地址、工人姓名
    const filteredList = workerList.filter((project) => {
        if (!searchKeyword.trim()) return true;
        const kw = searchKeyword.trim().toLowerCase();
        return (
            project.projectCode.toLowerCase().includes(kw) ||
            project.clientName.toLowerCase().includes(kw) ||
            project.address.toLowerCase().includes(kw) ||
            project.workers.some((w) => w.workerName?.toLowerCase().includes(kw))
        );
    });

    return (
        <>
            <div className="h-full bg-slate-50 p-6 overflow-auto">
                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">師傅工作總覽</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            顯示已確認、施工中、驗收中、已結案案件的師傅工作狀況。
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* 搜尋欄 */}
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                            <input
                                type="text"
                                placeholder="搜尋案號 / 客戶 / 地址 / 工人"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-64"
                            />
                        </div>
                        <button
                            onClick={() => setIsWorkerMgmtOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-primary)] text-white text-sm hover:bg-opacity-90"
                        >
                            <Users size={16} />
                            管理師傅
                        </button>
                    </div>
                </div>

                {/* ── Project cards ── */}
                <div className="space-y-4">
                    {filteredList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Search size={32} className="mb-3 text-slate-300" />
                            <p className="text-sm">找不到符合「{searchKeyword}」的案件。</p>
                        </div>
                    ) : (
                        filteredList.map((project) => {
                            const statusLabel = PROJECT_STATUS_LABELS[project.status];
                            const statusColor = PROJECT_STATUS_COLORS[project.status];
                            const isExpanded = expandedId === project.projectId;

                            return (
                                <div
                                    key={project.projectId}
                                    className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                                >
                                    {/* Card Header */}
                                    <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                                        {/* 左側：案件資訊 */}
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-sm text-slate-700">
                                                    {project.projectCode}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                {project.clientName}｜{project.address}
                                            </div>
                                        </div>

                                        {/* 右側：操作按鈕群 */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    setExpandedId(isExpanded ? null : project.projectId)
                                                }
                                                className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
                                            >
                                                {isExpanded ? (
                                                    <>收合明細 <ChevronUp size={16} /></>
                                                ) : (
                                                    <>展開明細 <ChevronDown size={16} /></>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setCaseWorkerProject(project)}
                                                className="flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--color-primary)] border border-slate-200 px-2 py-1 rounded-md hover:border-[var(--color-primary)] transition-colors"
                                            >
                                                <Users size={14} />
                                                管理工人
                                            </button>
                                        </div>
                                    </div>

                                    {/* 中間：匯總摘要 */}
                                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                        {project.workers.length === 0 ? (
                                            <p className="text-sm text-slate-500">
                                                此案件目前尚未設定工人紀錄。
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-3">
                                                <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5">
                                                    <span className="text-slate-400">工作天數</span>
                                                    <span className="font-semibold text-slate-800">
                                                        {project.totalWorkdays} 天
                                                    </span>
                                                </div>
                                                <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5">
                                                    <span className="text-slate-400">總工錢</span>
                                                    <span className="font-semibold text-slate-800">
                                                        ${project.totalWage.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5">
                                                    <span className="text-slate-400">總車馬費</span>
                                                    <span className="font-semibold text-slate-800">
                                                        ${project.totalTravel.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 border-[var(--color-primary)] text-xs flex items-center gap-1.5">
                                                    <span className="text-slate-400">總工人支出</span>
                                                    <span className="font-bold text-[var(--color-primary)]">
                                                        ${project.totalWorkerCost.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 展開區：工人明細 table */}
                                    {isExpanded && (
                                        <div className="px-4 py-4">
                                            {project.workers.length === 0 ? (
                                                <p className="text-sm text-slate-400 text-center py-4">
                                                    尚無工人紀錄，點擊「管理工人」新增。
                                                </p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-sm text-left border border-slate-200 rounded-lg overflow-hidden">
                                                        <thead className="bg-slate-100 text-slate-600">
                                                            <tr>
                                                                <th className="px-3 py-2">工人名字</th>
                                                                <th className="px-3 py-2">施作日期</th>
                                                                <th className="px-3 py-2 text-right">當天工錢</th>
                                                                <th className="px-3 py-2 text-right">車馬費</th>
                                                                <th className="px-3 py-2 text-right">小計</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {project.workers.map((w) => (
                                                                <tr
                                                                    key={w.id}
                                                                    className="border-t border-slate-200"
                                                                >
                                                                    <td className="px-3 py-2">
                                                                        {w.workerName || '—'}
                                                                    </td>
                                                                    <td className="px-3 py-2">{w.workday}</td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        ${w.dailyWage.toLocaleString()}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        ${w.travelExpenses.toLocaleString()}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-right font-medium">
                                                                        ${(w.dailyWage + w.travelExpenses).toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            <WorkerManagementModal
                isOpen={isWorkerMgmtOpen}
                onClose={() => setIsWorkerMgmtOpen(false)}
            />
            {caseWorkerProject && (
                <CaseWorkerModal
                    isOpen={!!caseWorkerProject}
                    onClose={() => setCaseWorkerProject(null)}
                    project={caseWorkerProject}
                />
            )}
        </>
    );
}