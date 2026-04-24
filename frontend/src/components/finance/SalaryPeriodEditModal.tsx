import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryService } from '@/services/salaryService';
import type { SalaryPeriod, SalaryStatus } from '@/types/salary';
import { X, Loader2 } from 'lucide-react';

const STATUS_OPTIONS: { value: SalaryStatus; label: string }[] = [
  { value: 'PENDING',   label: '待確認 PENDING' },
  { value: 'CONFIRMED', label: '已確認 CONFIRMED' },
  { value: 'PAID',      label: '已結清 PAID' },
];

const schema = z.object({
  label:       z.string().min(1, '期別名稱為必填'),
  periodStart: z.string().min(1, '開始日期為必填'),
  periodEnd:   z.string().min(1, '結束日期為必填'),
  status:      z.enum(['PENDING', 'CONFIRMED', 'PAID']),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  period: SalaryPeriod;
  onClose: () => void;
  onUpdated: () => void;
}

export default function SalaryPeriodEditModal({ period, onClose, onUpdated }: Props) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    reset({
      label:       period.label,
      periodStart: period.periodStart,
      periodEnd:   period.periodEnd,
      status:      period.status,
    });
  }, [period, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      salaryService.updatePeriod(period.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-periods'] });
      queryClient.invalidateQueries({ queryKey: ['salary-period', period.id] });
      onUpdated();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-base font-semibold text-slate-800">編輯薪資期別</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="px-6 py-5 space-y-4">

          {/* 期別名稱 */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">期別名稱</label>
            <input
              {...register('label')}
              placeholder="例：2026年4月上旬"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label.message}</p>}
          </div>

          {/* 期間 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">開始日期</label>
              <input
                type="date"
                {...register('periodStart')}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.periodStart && <p className="text-xs text-red-500 mt-1">{errors.periodStart.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">結束日期</label>
              <input
                type="date"
                {...register('periodEnd')}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.periodEnd && <p className="text-xs text-red-500 mt-1">{errors.periodEnd.message}</p>}
            </div>
          </div>

          {/* 狀態 */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">狀態</label>
            <select
              {...register('status')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
          </div>

          {/* Error */}
          {mutation.isError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {mutation.error instanceof Error ? mutation.error.message : '操作失敗，請稍後再試'}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-[var(--color-primary)] text-white rounded-lg py-2 text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
