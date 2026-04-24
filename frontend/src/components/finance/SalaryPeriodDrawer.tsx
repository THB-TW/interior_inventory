import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryService } from '@/services/salaryService';
import type { SalaryPeriod, SalaryItemDetail, WorkerSalarySummary } from '@/types/salary';
import StatusBadge from '@/components/common/StatusBadge';
import SalaryAdjustModal from './SalaryAdjustModal';
import {
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Banknote,
  User,
  Loader2,
} from 'lucide-react';
import dayjs from 'dayjs';

interface Props {
  periodId: number;
  onClose: () => void;
  onUpdated: () => void;
}

function fmt(n: number | null | undefined) {
  if (n == null) return '—';
  return `$${n.toLocaleString('zh-TW')}`;
}

const WAGE_LABEL: Record<string, string> = {
  DAILY: '日薪制',
  PROJECT_SHARE: '案件分潤',
};

export default function SalaryPeriodDrawer({ periodId, onClose, onUpdated }: Props) {
  const queryClient = useQueryClient();
  const [expandedWorker, setExpandedWorker] = useState<number | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<SalaryItemDetail | null>(null);

  // ── 查詢期別詳情（含 workers） ──
  const { data: period, isLoading: loadingPeriod } = useQuery<SalaryPeriod>({
    queryKey: ['salary-period', periodId],
    queryFn: () => salaryService.getPeriodById(periodId),
  });

  // ── 查詢期別所有明細 ──
  const { data: items, isLoading: loadingItems } = useQuery<SalaryItemDetail[]>({
    queryKey: ['salary-period-items', periodId],
    queryFn: () => salaryService.getItemsByPeriod(periodId),
  });

  // ── 確認期別 ──
  const confirmMutation = useMutation({
    mutationFn: () => salaryService.confirmPeriod(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-period', periodId] });
      queryClient.invalidateQueries({ queryKey: ['salary-periods'] });
    },
  });

  // ── 全部付款 ──
  const payAllMutation = useMutation({
    mutationFn: () => salaryService.markPeriodPaid(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-period', periodId] });
      queryClient.invalidateQueries({ queryKey: ['salary-period-items', periodId] });
      queryClient.invalidateQueries({ queryKey: ['salary-periods'] });
    },
  });

  // ── 單筆付款 ──
  const payItemMutation = useMutation({
    mutationFn: (itemId: number) => salaryService.markItemPaid(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-period', periodId] });
      queryClient.invalidateQueries({ queryKey: ['salary-period-items', periodId] });
      queryClient.invalidateQueries({ queryKey: ['salary-periods'] });
    },
  });

  const isLoading = loadingPeriod || loadingItems;
  const workers = period?.workers || [];
  const allItems = items || [];

  // 依 workerId 分組明細
  function getWorkerItems(workerId: number) {
    return allItems.filter(item => item.workerId === workerId);
  }

  // 計算進度百分比
  function getProgress(worker: WorkerSalarySummary) {
    if (worker.subtotal === 0) return 0;
    return Math.round((worker.paidAmount / worker.subtotal) * 100);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
        <aside className="relative z-50 w-full max-w-lg bg-white h-full shadow-xl flex flex-col animate-slide-in-right">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div>
              {period ? (
                <>
                  <h2 className="text-base font-semibold text-slate-800">{period.label}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {dayjs(period.periodStart).format('YYYY/MM/DD')} ~ {dayjs(period.periodEnd).format('YYYY/MM/DD')}
                  </p>
                </>
              ) : (
                <h2 className="text-base font-semibold text-slate-400">載入中...</h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              {period && <StatusBadge status={period.status} />}
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── Loading ── */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-[var(--color-primary)]" size={28} />
            </div>
          ) : (
            <>
              {/* ── 期別金額摘要 ── */}
              <div className="px-6 py-4 border-b border-slate-100 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-slate-400">應付總額</p>
                  <p className="text-sm font-semibold text-slate-800">{fmt(period?.totalAmount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">已付</p>
                  <p className="text-sm font-semibold text-emerald-600">{fmt(period?.paidAmount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">未付</p>
                  <p className="text-sm font-semibold text-amber-600">{fmt(period?.unpaidAmount)}</p>
                </div>
              </div>

              {/* ── 師傅列表 ── */}
              <div className="flex-1 overflow-auto">
                {workers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <User size={36} className="mb-2 text-slate-300" />
                    <p className="text-sm">此期別尚無薪資項目</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {workers.map(worker => {
                      const isExpanded = expandedWorker === worker.workerId;
                      const workerItems = getWorkerItems(worker.workerId);
                      const progress = getProgress(worker);

                      return (
                        <div key={worker.workerId}>
                          {/* 師傅卡片 */}
                          <button
                            className="w-full px-6 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                            onClick={() => setExpandedWorker(isExpanded ? null : worker.workerId)}
                          >
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                              <User size={16} className="text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-slate-800 truncate">{worker.workerNickname}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                                  {WAGE_LABEL[worker.wageType] || worker.wageType}
                                </span>
                                {worker.allPaid && (
                                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                )}
                              </div>
                              {/* 進度條 */}
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-400 shrink-0 w-8 text-right">{progress}%</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="text-sm font-semibold text-slate-800">{fmt(worker.subtotal)}</p>
                              <p className="text-[10px] text-slate-400">
                                未付 {fmt(worker.unpaidAmount)}
                              </p>
                            </div>
                            <div className="shrink-0 text-slate-400 ml-1">
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                          </button>

                          {/* 展開明細 */}
                          {isExpanded && (
                            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
                              {workerItems.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-2">無明細資料</p>
                              ) : (
                                <div className="space-y-2">
                                  {workerItems.map(item => (
                                    <div
                                      key={item.id}
                                      className="bg-white rounded-lg border border-slate-200 p-3 text-xs"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-slate-600">
                                            {item.projectCode || '—'}
                                          </span>
                                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                            {WAGE_LABEL[item.wageType] || item.wageType}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          {item.isPaid ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600">
                                              <CheckCircle2 size={12} />
                                              已付
                                            </span>
                                          ) : (
                                            <span className="text-amber-600">未付</span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-4 gap-2 text-slate-500">
                                        <div>
                                          <p className="text-[10px] text-slate-400">底薪</p>
                                          <p>{fmt(item.baseAmount)}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-slate-400">車馬費</p>
                                          <p>{fmt(item.travelExpenses)}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-slate-400">調整</p>
                                          <p className={item.adjustment !== 0 ? (item.adjustment > 0 ? 'text-emerald-600' : 'text-red-500') : ''}>
                                            {item.adjustment > 0 ? `+${fmt(item.adjustment)}` : fmt(item.adjustment)}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-slate-400">實領</p>
                                          <p className="font-semibold text-slate-800">{fmt(item.finalAmount)}</p>
                                        </div>
                                      </div>

                                      {item.note && (
                                        <p className="mt-2 text-slate-400 italic">備註：{item.note}</p>
                                      )}

                                      {item.isPaid && item.paidAt && (
                                        <p className="mt-1 text-[10px] text-slate-400">
                                          付款時間：{dayjs(item.paidAt).format('YYYY/MM/DD HH:mm')}
                                        </p>
                                      )}

                                      {/* 操作按鈕 */}
                                      {!item.isPaid && period?.status !== 'PAID' && (
                                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                                          <button
                                            onClick={() => setAdjustTarget(item)}
                                            className="px-2.5 py-1 text-xs bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors border border-slate-200"
                                          >
                                            調整金額
                                          </button>
                                          <button
                                            onClick={() => payItemMutation.mutate(item.id)}
                                            disabled={payItemMutation.isPending}
                                            className="px-2.5 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-50 inline-flex items-center gap-1"
                                          >
                                            <Banknote size={12} />
                                            標記付款
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Footer 操作 ── */}
              <div className="px-6 py-4 border-t border-slate-200 bg-white flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  關閉
                </button>
                {period?.status === 'PENDING' && (
                  <button
                    onClick={() => confirmMutation.mutate()}
                    disabled={confirmMutation.isPending}
                    className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {confirmMutation.isPending ? '處理中...' : '確認期別'}
                  </button>
                )}
                {period?.status === 'CONFIRMED' && (
                  <button
                    onClick={() => payAllMutation.mutate()}
                    disabled={payAllMutation.isPending}
                    className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {payAllMutation.isPending ? '處理中...' : '全部付款'}
                  </button>
                )}
              </div>
            </>
          )}
        </aside>
      </div>

      {/* ── 調整薪資 Modal ── */}
      {adjustTarget && (
        <SalaryAdjustModal
          item={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onAdjusted={() => {
            queryClient.invalidateQueries({ queryKey: ['salary-period', periodId] });
            queryClient.invalidateQueries({ queryKey: ['salary-period-items', periodId] });
            setAdjustTarget(null);
          }}
        />
      )}
    </>
  );
}
