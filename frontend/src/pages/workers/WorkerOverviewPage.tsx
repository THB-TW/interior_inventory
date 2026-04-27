import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWorkerOverview } from '@/services/workerService';
import type { WorkerProjectSummary } from '@/types/worker';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, ProjectStatus } from '@/types/project';
import { Loader2, ChevronDown, ChevronUp, Users, Search, HardHat, FileText, Filter } from 'lucide-react';
import WorkerManagementModal from '@/components/worker/WorkerManagementModal';
import CaseWorkerModal from '@/components/worker/CaseWorkerModal';
import Pagination from '@/components/common/Pagination';

const PAGE_SIZE = 5;

const STATUS_OPTIONS: { value: ProjectStatus | ''; label: string }[] = [
    { value: '', label: '所有狀態' },
    { value: ProjectStatus.QUOTING, label: PROJECT_STATUS_LABELS[ProjectStatus.QUOTING] },
    { value: ProjectStatus.CONFIRMED, label: PROJECT_STATUS_LABELS[ProjectStatus.CONFIRMED] },
    { value: ProjectStatus.IN_PROGRESS, label: PROJECT_STATUS_LABELS[ProjectStatus.IN_PROGRESS] },
    { value: ProjectStatus.INSPECTION, label: PROJECT_STATUS_LABELS[ProjectStatus.INSPECTION] },
    { value: ProjectStatus.CLOSED, label: PROJECT_STATUS_LABELS[ProjectStatus.CLOSED] },
];

export default function WorkerOverviewPage() {
    const navigate = useNavigate();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [isWorkerMgmtOpen, setIsWorkerMgmtOpen] = useState(false);
    const [caseWorkerProject, setCaseWorkerProject] = useState<WorkerProjectSummary | null>(null);

    const { data, isLoading, error } = useQuery<WorkerProjectSummary[]>({
        queryKey: ['worker-overview'],
        queryFn: getWorkerOverview,
    });

    const workerList = data || [];

    const filteredList = workerList.filter((project) => {
        const matchStatus = statusFilter === '' || project.status === statusFilter;
        if (!matchStatus) return false;
        if (!searchKeyword.trim()) return true;
        const kw = searchKeyword.trim().toLowerCase();
        return (
            project.projectCode.toLowerCase().includes(kw) ||
            project.clientName.toLowerCase().includes(kw) ||
            project.address.toLowerCase().includes(kw) ||
            project.workers.some((w) => w.workerName?.toLowerCase().includes(kw))
        );
    });

    const totalPages = Math.ceil(filteredList.length / PAGE_SIZE);
    const pagedList = filteredList.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    return (
        <>
            <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">

                {/* ── Header ── */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-[var(--color-primary)] text-white p-2 rounded-lg">
                            <HardHat size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">師傅工作總覽</h1>
                            <p className="text-sm text-slate-500">顯示已確認、施工中、驗收中、已結案案件的師傅工作狀況。</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsWorkerMgmtOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white hover:bg-opacity-90 rounded-lg transition-colors font-medium shadow-sm"
                    >
                        <Users size={18} />
                        管理師傅
                    </button>
                </header>

                {/* ── Main Content ── */}
                <main className="flex-1 p-6 overflow-auto">

                    {/* Toolbar */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="relative w-full sm:w-96">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="搜尋案號 / 客戶名稱 / 地址 / 工人姓名"
                                value={searchKeyword}
                                onChange={(e) => { setSearchKeyword(e.target.value); setCurrentPage(0); }}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Filter size={18} className="text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value as ProjectStatus | ''); setCurrentPage(0); }}
                                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 w-full sm:w-auto outline-none"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── Data States ── */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                            <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
                            <p>載入師傅工作資料中...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center">
                            <p className="font-bold mb-1">無法取得師傅資料</p>
                            <p className="text-sm">{error instanceof Error ? error.message : '未知錯誤'}</p>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-500 shadow-sm">
                            <HardHat size={48} className="mb-4 text-slate-300" />
                            <p className="text-lg font-medium text-slate-600 mb-1">查無符合條件的案件</p>
                            <p className="text-sm">試著更換搜尋條件或狀態篩選。</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Project cards */}
                            <div className="divide-y divide-slate-100">
                                {pagedList.map((project) => {
                                    const statusLabel = PROJECT_STATUS_LABELS[project.status];
                                    const statusColor = PROJECT_STATUS_COLORS[project.status];
                                    const isExpanded = expandedId === project.projectId;

                                    return (
                                        <div key={project.projectId} className="overflow-hidden">
                                            {/* Card Header */}
                                            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
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

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/workers/${project.projectId}/report`)}
                                                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--color-primary)] border border-slate-200 px-2 py-1 rounded-md hover:border-[var(--color-primary)] transition-colors"
                                                    >
                                                        <FileText size={14} />
                                                        工資報表
                                                    </button>
                                                    <button
                                                        onClick={() => setExpandedId(isExpanded ? null : project.projectId)}
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

                                            {/* 匯總摘要 */}
                                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                                {project.workers.length === 0 ? (
                                                    <p className="text-sm text-slate-500">此案件目前尚未設定工人紀錄。</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-3">
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
                                                        <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5">
                                                            <span className="text-slate-400">總餐費</span>
                                                            <span className="font-semibold text-slate-800">
                                                                ${project.totalMeal.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs flex items-center gap-1.5">
                                                            <span className="text-slate-400">總工人支出</span>
                                                            <span className="font-bold text-[var(--color-primary)]">
                                                                ${project.totalWorkerCost.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 展開區：group by worker */}
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
                                                                        <th className="px-3 py-2 text-center">施作天數</th>
                                                                        <th className="px-3 py-2 text-right">總工錢</th>
                                                                        <th className="px-3 py-2 text-right">總車馬費</th>
                                                                        <th className="px-3 py-2 text-right">總餐費</th>
                                                                        <th className="px-3 py-2 text-right">小計</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {Object.values(
                                                                        project.workers.reduce<Record<string, {
                                                                            workerName: string | null;
                                                                            workerId: number | null;
                                                                            totalWage: number;
                                                                            totalTravel: number;
                                                                            totalMeal: number;
                                                                            count: number;
                                                                        }>>((acc, w) => {
                                                                            const key = w.workerId != null
                                                                                ? String(w.workerId)
                                                                                : `unnamed-${w.workerName}`;
                                                                            if (!acc[key]) {
                                                                                acc[key] = {
                                                                                    workerName: w.workerName,
                                                                                    workerId: w.workerId,
                                                                                    totalWage: w.dailyWage,
                                                                                    totalTravel: w.travelExpenses,
                                                                                    totalMeal: w.mealAllowance,
                                                                                    count: 1,
                                                                                };
                                                                            } else {
                                                                                acc[key].totalWage += w.dailyWage;
                                                                                acc[key].totalTravel += w.travelExpenses;
                                                                                acc[key].totalMeal += w.mealAllowance;
                                                                                acc[key].count += 1;
                                                                            }
                                                                            return acc;
                                                                        }, {})
                                                                    ).map((g) => (
                                                                        <tr
                                                                            key={g.workerId ?? g.workerName}
                                                                            className="border-t border-slate-200"
                                                                        >
                                                                            <td className="px-3 py-2">{g.workerName || '—'}</td>
                                                                            <td className="px-3 py-2 text-center">{g.count} 天</td>
                                                                            <td className="px-3 py-2 text-right">${g.totalWage.toLocaleString()}</td>
                                                                            <td className="px-3 py-2 text-right">${g.totalTravel.toLocaleString()}</td>
                                                                            <td className="px-3 py-2 text-right">${g.totalMeal.toLocaleString()}</td>
                                                                            <td className="px-3 py-2 text-right font-medium">
                                                                                ${(g.totalWage + g.totalTravel + g.totalMeal).toLocaleString()}
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
                                })}
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalElements={filteredList.length}
                                pageSize={PAGE_SIZE}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    )}
                </main>
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