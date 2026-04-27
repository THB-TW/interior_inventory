import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSearch, Search, Filter } from 'lucide-react';
import { financeService } from '@/services/financeService';
import SupplierInvoiceTab from '@/components/finance/SupplierInvoiceTab';
import Pagination from '@/components/common/Pagination';
import type { ProjectProfitDTO } from '@/types/finance';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, ProjectStatus } from '@/types/project';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: ProjectStatus | ''; label: string }[] = [
    { value: '', label: '所有狀態' },
    { value: ProjectStatus.INQUIRY, label: PROJECT_STATUS_LABELS[ProjectStatus.INQUIRY] },
    { value: ProjectStatus.QUOTING, label: PROJECT_STATUS_LABELS[ProjectStatus.QUOTING] },
    { value: ProjectStatus.CONFIRMED, label: PROJECT_STATUS_LABELS[ProjectStatus.CONFIRMED] },
    { value: ProjectStatus.IN_PROGRESS, label: PROJECT_STATUS_LABELS[ProjectStatus.IN_PROGRESS] },
    { value: ProjectStatus.INSPECTION, label: PROJECT_STATUS_LABELS[ProjectStatus.INSPECTION] },
    { value: ProjectStatus.CLOSED, label: PROJECT_STATUS_LABELS[ProjectStatus.CLOSED] },
];

export default function SupplierInvoicePage() {
    const [selectedProject, setSelectedProject] = useState<ProjectProfitDTO | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
    const [currentPage, setCurrentPage] = useState(0);

    const { data, isLoading } = useQuery<ProjectProfitDTO[]>({
        queryKey: ['finance-projects'],
        queryFn: financeService.getAllProfits,
    });

    const rows = data ?? [];

    // 搜尋 + 狀態篩選（與 FinancePage 相同做法）
    const filtered = rows.filter(r => {
        const matchStatus = statusFilter === '' || r.status === statusFilter;
        if (!matchStatus) return false;
        if (!searchKeyword.trim()) return true;
        const kw = searchKeyword.trim().toLowerCase();
        return (
            r.clientName.toLowerCase().includes(kw) ||
            r.projectCode.toLowerCase().includes(kw)
        );
    });

    // 分頁
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    const handleSearch = (kw: string) => {
        setSearchKeyword(kw);
        setCurrentPage(0);
        setSelectedProject(null);
    };

    const handleStatusFilter = (s: ProjectStatus | '') => {
        setStatusFilter(s);
        setCurrentPage(0);
        setSelectedProject(null);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">

            {/* ── Header ── */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
                <div className="bg-[var(--color-primary)] text-white p-2 rounded-lg">
                    <FileSearch size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">建材商對帳單</h1>
                    <p className="text-sm text-slate-500">上傳建材商 PDF，自動比對案件材料，人工確認後寫入。</p>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-auto">
                <div className="flex gap-6 h-full">

                    {/* ── 左側：搜尋 + 篩選 + 案件列表 ── */}
                    <div className="w-72 shrink-0 flex flex-col gap-3">

                        {/* 搜尋欄 */}
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="搜尋案件 / 客戶"
                                value={searchKeyword}
                                onChange={e => handleSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                            />
                        </div>

                        {/* 狀態篩選 — 與 FinancePage 完全相同的 select 樣式 */}
                        <div className="flex items-center gap-2">
                            <Filter size={15} className="text-slate-400 shrink-0" />
                            <select
                                value={statusFilter}
                                onChange={e => handleStatusFilter(e.target.value as ProjectStatus | '')}
                                className="flex-1 px-3 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 outline-none"
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* 案件列表 */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            {isLoading ? (
                                <div className="p-6 text-center text-slate-400 text-sm">載入案件中...</div>
                            ) : paginated.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 text-sm">查無符合條件的案件</div>
                            ) : (
                                paginated.map((r, i) => {
                                    const statusColor = PROJECT_STATUS_COLORS[r.status as ProjectStatus] ?? 'bg-slate-100 text-slate-500';
                                    const statusLabel = PROJECT_STATUS_LABELS[r.status as ProjectStatus] ?? r.status;
                                    return (
                                        <button
                                            key={r.projectId}
                                            onClick={() => setSelectedProject(r)}
                                            className={[
                                                'flex flex-col gap-1 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50',
                                                i !== 0 ? 'border-t border-slate-100' : '',
                                                selectedProject?.projectId === r.projectId
                                                    ? 'bg-[var(--color-primary)]/5 border-l-2 border-l-[var(--color-primary)]'
                                                    : '',
                                            ].join(' ')}
                                        >
                                            <span className="font-mono text-xs text-slate-400">{r.projectCode}</span>
                                            <span className="font-medium text-slate-800">{r.clientName}</span>
                                            {/* 狀態 badge — 跟 FinancePage 表格裡的 badge 同樣樣式 */}
                                            <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${statusColor}`}>
                                                {statusLabel}
                                            </span>
                                        </button>
                                    );
                                })
                            )}

                            {/* 分頁 */}
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalElements={filtered.length}
                                    pageSize={PAGE_SIZE}
                                    onPageChange={p => {
                                        setCurrentPage(p);
                                        setSelectedProject(null);
                                    }}
                                />
                            )}
                        </div>

                        {/* 筆數提示 */}
                        {!isLoading && (
                            <p className="text-xs text-slate-400 text-center">
                                共 {filtered.length} 個案件
                            </p>
                        )}
                    </div>

                    {/* ── 右側：對帳單內容 ── */}
                    <div className="flex-1 min-w-0">
                        {selectedProject ? (
                            <SupplierInvoiceTab projectId={selectedProject.projectId} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                                <FileSearch size={48} className="text-slate-300" />
                                <p className="text-sm">請從左側選擇要對帳的案件</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}