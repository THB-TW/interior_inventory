import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSearch, Search } from 'lucide-react';
import { financeService } from '@/services/financeService';
import SupplierInvoiceTab from '@/components/finance/SupplierInvoiceTab';
import type { ProjectProfitDTO } from '@/types/finance';

export default function SupplierInvoicePage() {
    const [selectedProject, setSelectedProject] = useState<ProjectProfitDTO | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');

    const { data, isLoading } = useQuery<ProjectProfitDTO[]>({
        queryKey: ['finance-projects'],
        queryFn: financeService.getAllProfits,
    });

    const rows = data ?? [];
    const filtered = rows.filter(r => {
        if (!searchKeyword.trim()) return true;
        const kw = searchKeyword.trim().toLowerCase();
        return r.clientName.toLowerCase().includes(kw) || r.projectCode.toLowerCase().includes(kw);
    });

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

                    {/* ── 左側：案件選擇 ── */}
                    <div className="w-72 shrink-0 flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            <input
                                type="text"
                                placeholder="搜尋案件 / 客戶"
                                value={searchKeyword}
                                onChange={e => setSearchKeyword(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            {isLoading ? (
                                <div className="p-6 text-center text-slate-400 text-sm">載入案件中...</div>
                            ) : filtered.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 text-sm">查無案件</div>
                            ) : (
                                filtered.map((r, i) => (
                                    <button
                                        key={r.projectId}
                                        onClick={() => setSelectedProject(r)}
                                        className={`flex flex-col gap-0.5 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50 ${i !== 0 ? 'border-t border-slate-100' : ''} ${selectedProject?.projectId === r.projectId ? 'bg-[var(--color-primary)]/5 border-l-2 border-l-[var(--color-primary)]' : ''}`}
                                    >
                                        <span className="font-mono text-xs text-slate-400">{r.projectCode}</span>
                                        <span className="font-medium text-slate-800">{r.clientName}</span>
                                    </button>
                                ))
                            )}
                        </div>
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