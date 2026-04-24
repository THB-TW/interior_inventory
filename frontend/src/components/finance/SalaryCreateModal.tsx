import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { salaryService } from '@/services/salaryService';
import type { SalaryPeriodCreateRequest } from '@/types/salary';
import { X, Loader2, CalendarRange } from 'lucide-react';
import dayjs from 'dayjs';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function SalaryCreateModal({ onClose, onCreated }: Props) {
  const now = dayjs();
  // 預設值：本月1日 ~ 15日
  const [periodStart, setPeriodStart] = useState(now.startOf('month').format('YYYY-MM-DD'));
  const [periodEnd, setPeriodEnd] = useState(now.date(15).format('YYYY-MM-DD'));
  const [label, setLabel] = useState(`${now.year()}年${now.month() + 1}月上旬`);
  const [formError, setFormError] = useState('');

  const mutation = useMutation({
    mutationFn: (req: SalaryPeriodCreateRequest) => salaryService.createPeriod(req),
    onSuccess: () => onCreated(),
    onError: (err: Error) => setFormError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!periodStart || !periodEnd || !label.trim()) {
      setFormError('請填寫所有必填欄位');
      return;
    }

    if (dayjs(periodEnd).isBefore(dayjs(periodStart))) {
      setFormError('結束日期不能早於開始日期');
      return;
    }

    mutation.mutate({ periodStart, periodEnd, label: label.trim() });
  }

  // 快速選擇按鈕
  function setPreset(type: 'first' | 'second') {
    const year = now.year();
    const month = now.month() + 1;
    if (type === 'first') {
      setPeriodStart(now.startOf('month').format('YYYY-MM-DD'));
      setPeriodEnd(now.date(15).format('YYYY-MM-DD'));
      setLabel(`${year}年${month}月上旬`);
    } else {
      setPeriodStart(now.date(16).format('YYYY-MM-DD'));
      setPeriodEnd(now.endOf('month').format('YYYY-MM-DD'));
      setLabel(`${year}年${month}月下旬`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CalendarRange size={18} className="text-[var(--color-primary)]" />
            <h3 className="text-base font-semibold text-slate-800">建立薪資期別</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">

            {/* 快速選擇 */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">快速選擇</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreset('first')}
                  className="flex-1 px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors"
                >
                  本月上旬 (1~15日)
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('second')}
                  className="flex-1 px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors"
                >
                  本月下旬 (16~月底)
                </button>
              </div>
            </div>

            {/* 期別名稱 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                期別名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="例：2026年4月上旬"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-shadow"
              />
            </div>

            {/* 日期區間 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                  開始日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={e => setPeriodStart(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-shadow"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                  結束日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={e => setPeriodEnd(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-shadow"
                />
              </div>
            </div>

            {/* 錯誤訊息 */}
            {formError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-600 hover:bg-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-[var(--color-primary)] text-white rounded-lg py-2 text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  建立中...
                </>
              ) : (
                '建立期別'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
