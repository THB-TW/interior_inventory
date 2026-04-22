// frontend/src/pages/quotes/QuoteOverviewPage.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuoteOverview } from '@/services/quoteService';
import type { QuoteProjectUsage } from '@/types/quote';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/types/project';
import { Loader2, ChevronDown, ChevronUp, FileText, Plus, ClipboardList, Search } from 'lucide-react';
import MaterialManagementModal from '@/components/material/MaterialManagementModal';
import CaseMaterialModal from '@/components/quote/CaseMaterialModal';
import OrderSheetModal from '@/components/quote/OrderSheetModal';

export default function QuoteOverviewPage() {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [materialModalProject, setMaterialModalProject] = useState<QuoteProjectUsage | null>(null);
    const [orderSheetProject, setOrderSheetProject] = useState<QuoteProjectUsage | null>(null);

    const { data, isLoading, error } = useQuery<QuoteProjectUsage[]>({
        queryKey: ['quote-overview'],
        queryFn: getQuoteOverview,
    });

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>載入報價 / 用料資料中...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center text-red-600">
                無法取得報價資料：
                {error instanceof Error ? error.message : '未知錯誤'}
            </div>
        );
    }

    const quoteList = data || [];

    if (quoteList.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <FileText size={40} className="mb-3 text-slate-300" />
                <p>目前沒有符合條件的案件（已確認 / 施工中 / 驗收中 / 已結案）。</p>
            </div>
        );
    }

    // ★ 前端 filter
    const filteredList = quoteList.filter((project) => {
        if (!searchKeyword.trim()) return true;
        const kw = searchKeyword.trim().toLowerCase();
        return (
            project.projectCode.toLowerCase().includes(kw) ||
            project.clientName.toLowerCase().includes(kw) ||
            project.address.toLowerCase().includes(kw)
        );
    });

    return (
        <>
            <div className="h-full bg-slate-50 p-6 overflow-auto">
                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">
                            報價 / 案件用料總覽
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            顯示已確認、施工中、驗收中、已結案案件的用料狀況（進貨 / 剩料 / 退貨）。
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* ★ 搜尋欄 */}
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                            <input
                                type="text"
                                placeholder="搜尋案號 / 客戶 / 地址"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-56"
                            />
                        </div>
                        <button
                            onClick={() => setIsMaterialModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-primary)] text-white text-sm hover:bg-opacity-90"
                        >
                            <Plus size={16} />
                            新增材料
                        </button>
                    </div>
                </div>

                {/* ── Project cards ── */}
                <div className="space-y-4">
                    {/* ★ 搜尋無結果 */}
                    {filteredList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Search size={32} className="mb-3 text-slate-300" />
                            <p className="text-sm">找不到符合「{searchKeyword}」的案件。</p>
                        </div>
                    ) : (
                        // ★ 改成 filteredList.map
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
                                                {project.clientName} ｜ {project.address}
                                            </div>
                                        </div>

                                        {/* 右側：操作按鈕群 */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setOrderSheetProject(project)}
                                                className="flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--color-primary)] border border-slate-200 px-2 py-1 rounded-md hover:border-[var(--color-primary)] transition-colors"
                                            >
                                                <ClipboardList size={14} />
                                                生成叫貨單
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setExpandedId(isExpanded ? null : project.projectId)
                                                }
                                                className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
                                            >
                                                {isExpanded ? (
                                                    <>收合材料單 <ChevronUp size={16} /></>
                                                ) : (
                                                    <>列出材料單 <ChevronDown size={16} /></>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setMaterialModalProject(project)}
                                                className="flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--color-primary)] border border-slate-200 px-2 py-1 rounded-md hover:border-[var(--color-primary)] transition-colors"
                                            >
                                                <Plus size={14} />
                                                管理用料
                                            </button>
                                        </div>
                                    </div>

                                    {/* 中間：用料 Chip 摘要 */}
                                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                        {project.materials.length === 0 ? (
                                            <p className="text-sm text-slate-500">
                                                此案件目前尚未設定用料。
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {project.materials.map((m) => (
                                                    <div
                                                        key={m.materialId}
                                                        className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 flex items-center gap-2"
                                                    >
                                                        <span className="font-medium">{m.materialName}</span>
                                                        {m.leftoverQuantity > 0 && (
                                                            <span className="text-amber-600">
                                                                剩料使用 {m.leftoverQuantity}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 展開區：完整材料單 table */}
                                    {isExpanded && (
                                        <div className="px-4 py-4 space-y-3">
                                            <div className="text-sm text-slate-600 space-y-1">
                                                <div>地址：{project.address}</div>
                                                <div>備註：{project.description || '—'}</div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-sm text-left border border-slate-200 rounded-lg overflow-hidden">
                                                    <thead className="bg-slate-100 text-slate-600">
                                                        <tr>
                                                            <th className="px-3 py-2">材料名稱</th>
                                                            <th className="px-3 py-2 text-right">總使用量</th>
                                                            <th className="px-3 py-2 text-right">進貨量</th>
                                                            <th className="px-3 py-2 text-right">剩料量</th>
                                                            <th className="px-3 py-2 text-right">退貨量</th>
                                                            <th className="px-3 py-2 text-right">材料單價</th>
                                                            <th className="px-3 py-2 text-right">小計</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {project.materials.map((m) => (
                                                            <tr
                                                                key={m.materialId}
                                                                className="border-t border-slate-200"
                                                            >
                                                                <td className="px-3 py-2">{m.materialName}</td>
                                                                <td className="px-3 py-2 text-right font-medium">
                                                                    {m.totalQuantity}
                                                                </td>
                                                                <td className="px-3 py-2 text-right">
                                                                    {m.purchaseQuantity}
                                                                </td>
                                                                <td className="px-3 py-2 text-right text-amber-700">
                                                                    {m.leftoverQuantity}
                                                                </td>
                                                                <td className="px-3 py-2 text-right text-slate-500">
                                                                    {m.returnQuantity}
                                                                </td>
                                                                <td className="px-3 py-2 text-right">
                                                                    {m.unitPrice != null
                                                                        ? m.unitPrice.toLocaleString()
                                                                        : '—'}
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-medium">
                                                                    {m.lineCost != null
                                                                        ? m.lineCost.toLocaleString()
                                                                        : '—'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            <MaterialManagementModal
                isOpen={isMaterialModalOpen}
                onClose={() => setIsMaterialModalOpen(false)}
            />
            {materialModalProject && (
                <CaseMaterialModal
                    isOpen={!!materialModalProject}
                    onClose={() => setMaterialModalProject(null)}
                    project={materialModalProject}
                />
            )}
            {orderSheetProject && (
                <OrderSheetModal
                    isOpen={!!orderSheetProject}
                    onClose={() => setOrderSheetProject(null)}
                    project={orderSheetProject}
                />
            )}
        </>
    );
}