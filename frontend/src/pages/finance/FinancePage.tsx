import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeService } from '@/services/financeService';
import type { ProjectProfitDTO } from '@/types/finance';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, ProjectStatus } from '@/types/project';
import { Loader2, Search, Filter, TrendingUp } from 'lucide-react';
import FinanceDetailDrawer from '@/components/finance/FinanceDetailDrawer';
import Pagination from '@/components/common/Pagination';

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

function fmt(n: number | null) {
    if (n == null) return '—';
    return `$${n.toLocaleString('zh-TW')}`;
}

function ProfitBadge({ rate }: { rate: number | null }) {
    if (rate == null) return <span className="text-slate-400 text-sm">未設合約</span>;
    const color = rate >= 30 ? 'text-green-600' : rate >= 0 ? 'text-yellow-600' : 'text-red-500';
    return <span className={`font-semibold ${color}`}>{rate.toFixed(1)}%</span>;
}

const PAYMENT_BADGE: Record<string, { label: string; cls: string }> = {
    COMPLETED: { label: '已收款', cls: 'bg-green-100 text-green-700' },
    PARTIAL: { label: '部分收款', cls: 'bg-yellow-100 text-yellow-700' },
    PENDING: { label: '未收款', cls: 'bg-slate-100 text-slate-500' },
};

export default function FinancePage() {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [selected, setSelected] = useState<ProjectProfitDTO | null>(null);

    const { data, isLoading, error, refetch } = useQuery<ProjectProfitDTO[]>({
        queryKey: ['finance-projects'],
        queryFn: financeService.getAllProfits,
    });

    const rows = data || [];

    // 搜尋 + 狀態篩選（前端過濾，跟 QuoteOverviewPage 同樣做法）
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

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    // KPI（依 filtered 算，跟搜尋結果連動）
    const totalContract = filtered.reduce((s, r) => s + (r.contractAmount ?? 0), 0);
    const totalProfit = filtered.reduce((s, r) => s + r.profit, 0);
    const totalMaterial = filtered.reduce((s, r) => s + r.materialCost, 0);
    const totalWorker = filtered.reduce((s, r) => s + r.workerCost + r.travelCost, 0);

    return (
        <>
            <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">

                {/* ── Header ── */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
                    <div className="bg-[var(--color-primary)] text-white p-2 rounded-lg">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">財務總覽</h1>
                        <p className="text-sm text-slate-500">各案件合約金額、材料成本、工資與利潤匯總。</p>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-auto space-y-4">

                    {/* ── Toolbar（搜尋 + 狀態篩選）── */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="relative w-full sm:w-96">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="搜尋客戶名稱 / 案件編號"
                                value={searchKeyword}
                                onChange={e => { setSearchKeyword(e.target.value); setCurrentPage(0); }}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Filter size={18} className="text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={e => { setStatusFilter(e.target.value as ProjectStatus | ''); setCurrentPage(0); }}
                                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 w-full sm:w-auto outline-none"
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── KPI 卡片 ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: '合約總額', value: fmt(totalContract), sub: `${filtered.length} 個案件` },
                            { label: '材料成本', value: fmt(totalMaterial), sub: '' },
                            { label: '師傅工資', value: fmt(totalWorker), sub: '含車馬費' },
                            {
                                label: '總利潤',
                                value: fmt(totalProfit),
                                sub: totalContract > 0 ? `利潤率 ${((totalProfit / totalContract) * 100).toFixed(1)}%` : '',
                            },
                        ].map(k => (
                            <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-sm">
                                <p className="text-xs text-slate-400">{k.label}</p>
                                <p className="text-lg font-semibold text-slate-800">{k.value}</p>
                                {k.sub && <p className="text-xs text-slate-400">{k.sub}</p>}
                            </div>
                        ))}
                    </div>

                    {/* ── 資料狀態 ── */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                            <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
                            <p>載入財務資料中...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex flex-col items-center text-center">
                            <p className="font-bold mb-1">無法取得財務資料</p>
                            <p className="text-sm">{error instanceof Error ? error.message : '未知錯誤'}</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center text-slate-500 shadow-sm">
                            <TrendingUp size={48} className="mb-4 text-slate-300" />
                            <p className="text-lg font-medium text-slate-600 mb-1">查無符合條件的案件</p>
                            <p className="text-sm">試著更換搜尋條件或狀態篩選。</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                                    <tr>
                                        {['案件編號', '客戶', '狀態', '合約金額', '材料', '工資', '利潤', '利潤率', '收款'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paged.map(r => {
                                        const pay = r.paymentStatus
                                            ? (PAYMENT_BADGE[r.paymentStatus] ?? PAYMENT_BADGE.PENDING)
                                            : PAYMENT_BADGE.PENDING;
                                        const statusColor = PROJECT_STATUS_COLORS[r.status as ProjectStatus] ?? 'bg-slate-100 text-slate-500';
                                        const statusLabel = PROJECT_STATUS_LABELS[r.status as ProjectStatus] ?? r.status;
                                        return (
                                            <tr
                                                key={r.projectId}
                                                className="hover:bg-slate-50 cursor-pointer transition-colors"
                                                onClick={() => setSelected(r)}
                                            >
                                                <td className="px-4 py-3 font-mono text-slate-700">{r.projectCode}</td>
                                                <td className="px-4 py-3 text-slate-800">{r.clientName}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                                                        {statusLabel}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{fmt(r.contractAmount)}</td>
                                                <td className="px-4 py-3 text-orange-600">{fmt(r.materialCost)}</td>
                                                <td className="px-4 py-3 text-blue-600">{fmt(r.workerCost + r.travelCost)}</td>
                                                <td className="px-4 py-3">{fmt(r.profit)}</td>
                                                <td className="px-4 py-3"><ProfitBadge rate={r.profitRate} /></td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${pay.cls}`}>
                                                        {pay.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalElements={filtered.length}
                                pageSize={PAGE_SIZE}
                                onPageChange={page => setCurrentPage(page)}
                            />
                        </div>
                    )}
                </main>
            </div>

            {selected && (
                <FinanceDetailDrawer
                    data={selected}
                    onClose={() => setSelected(null)}
                    onUpdated={updated => {
                        refetch();
                        setSelected(null);
                    }}
                />
            )}
        </>
    );
}