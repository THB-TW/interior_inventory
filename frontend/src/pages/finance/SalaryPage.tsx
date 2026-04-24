import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryService } from '@/services/salaryService';
import type { SalaryPeriod } from '@/types/salary';
import StatusBadge from '@/components/common/StatusBadge';
import Pagination from '@/components/common/Pagination';
import SalaryPeriodDrawer from '@/components/finance/SalaryPeriodDrawer';
import SalaryCreateModal from '@/components/finance/SalaryCreateModal';
import {
  Loader2,
  Wallet,
  Plus,
  CheckCircle2,
  Banknote,
  CalendarRange,
} from 'lucide-react';
import dayjs from 'dayjs';

const PAGE_SIZE = 10;

function fmt(n: number | null | undefined) {
  if (n == null) return '—';
  return `$${n.toLocaleString('zh-TW')}`;
}

export default function SalaryPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<SalaryPeriod | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // ── 查詢所有期別 ──
  const { data: periods, isLoading, error } = useQuery<SalaryPeriod[]>({
    queryKey: ['salary-periods'],
    queryFn: salaryService.getAllPeriods,
  });

  // ── 確認期別 ──
  const confirmMutation = useMutation({
    mutationFn: (periodId: number) => salaryService.confirmPeriod(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-periods'] });
    },
  });

  // ── 全部付款 ──
  const payAllMutation = useMutation({
    mutationFn: (periodId: number) => salaryService.markPeriodPaid(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-periods'] });
    },
  });

  const rows = periods || [];
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const paged = rows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // KPI
  const totalAmount = rows.reduce((s, r) => s + (r.totalAmount ?? 0), 0);
  const totalPaid = rows.reduce((s, r) => s + (r.paidAmount ?? 0), 0);
  const totalUnpaid = rows.reduce((s, r) => s + (r.unpaidAmount ?? 0), 0);

  return (
    <>
      <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">

        {/* ── Header ── */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--color-primary)] text-white p-2 rounded-lg">
              <Wallet size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">師傅薪資</h1>
              <p className="text-sm text-slate-500">依期別管理師傅薪資結算與付款。</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
          >
            <Plus size={16} />
            建立期別
          </button>
        </header>

        <main className="flex-1 p-6 overflow-auto space-y-4">

          {/* ── KPI 卡片 ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '期別數量', value: `${rows.length} 期`, sub: '', icon: CalendarRange, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
              { label: '應付總額', value: fmt(totalAmount), sub: '', icon: Wallet, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
              { label: '已付金額', value: fmt(totalPaid), sub: '', icon: CheckCircle2, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
              { label: '未付金額', value: fmt(totalUnpaid), sub: totalAmount > 0 ? `佔比 ${((totalUnpaid / totalAmount) * 100).toFixed(1)}%` : '', icon: Banknote, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
                <div className={`p-2 rounded-lg ${k.iconBg}`}>
                  <k.icon size={18} className={k.iconColor} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs text-slate-400">{k.label}</p>
                  <p className="text-lg font-semibold text-slate-800 truncate">{k.value}</p>
                  {k.sub && <p className="text-xs text-slate-400">{k.sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* ── 資料狀態 ── */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
              <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
              <p>載入薪資資料中...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex flex-col items-center text-center">
              <p className="font-bold mb-1">無法取得薪資資料</p>
              <p className="text-sm">{error instanceof Error ? error.message : '未知錯誤'}</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center text-slate-500 shadow-sm">
              <Wallet size={48} className="mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-600 mb-1">尚無薪資期別</p>
              <p className="text-sm mb-4">點擊右上角「建立期別」開始管理師傅薪資。</p>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                <Plus size={16} />
                建立第一個期別
              </button>
            </div>
          ) : (

            /* ── 期別表格 ── */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                  <tr>
                    {['期別名稱', '期間', '狀態', '應付總額', '已付', '未付', '操作'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map(period => (
                    <tr
                      key={period.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedPeriod(period)}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{period.label}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <CalendarRange size={13} className="text-slate-400" />
                          {dayjs(period.periodStart).format('MM/DD')} ~ {dayjs(period.periodEnd).format('MM/DD')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={period.status} />
                      </td>
                      <td className="px-4 py-3 font-medium">{fmt(period.totalAmount)}</td>
                      <td className="px-4 py-3 text-emerald-600">{fmt(period.paidAmount)}</td>
                      <td className="px-4 py-3 text-amber-600">{fmt(period.unpaidAmount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          {period.status === 'PENDING' && (
                            <button
                              onClick={() => confirmMutation.mutate(period.id)}
                              disabled={confirmMutation.isPending}
                              className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50"
                            >
                              確認
                            </button>
                          )}
                          {period.status === 'CONFIRMED' && (
                            <button
                              onClick={() => payAllMutation.mutate(period.id)}
                              disabled={payAllMutation.isPending}
                              className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-50"
                            >
                              全部付款
                            </button>
                          )}
                          {period.status === 'PAID' && (
                            <span className="text-xs text-slate-400">已結清</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={rows.length}
                pageSize={PAGE_SIZE}
                onPageChange={page => setCurrentPage(page)}
              />
            </div>
          )}
        </main>
      </div>

      {/* ── 期別詳情 Drawer ── */}
      {selectedPeriod && (
        <SalaryPeriodDrawer
          periodId={selectedPeriod.id}
          onClose={() => setSelectedPeriod(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['salary-periods'] });
            setSelectedPeriod(null);
          }}
        />
      )}

      {/* ── 建立期別 Modal ── */}
      {showCreate && (
        <SalaryCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['salary-periods'] });
            setShowCreate(false);
          }}
        />
      )}
    </>
  );
}
