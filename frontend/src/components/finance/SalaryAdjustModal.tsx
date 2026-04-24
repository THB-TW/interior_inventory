import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { salaryService } from '@/services/salaryService';
import type { SalaryItemDetail } from '@/types/salary';
import { X, Loader2, Settings2 } from 'lucide-react';

interface Props {
  item: SalaryItemDetail;
  onClose: () => void;
  onAdjusted: () => void;
}

function fmt(n: number | null | undefined) {
  if (n == null) return '—';
  return `$${n.toLocaleString('zh-TW')}`;
}

export default function SalaryAdjustModal({ item, onClose, onAdjusted }: Props) {
  const [adjustment, setAdjustment] = useState(item.adjustment.toString());
  const [note, setNote] = useState(item.note || '');
  const [formError, setFormError] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      salaryService.adjustItem(item.id, {
        adjustment: Number(adjustment),
        note: note.trim() || undefined,
      }),
    onSuccess: () => onAdjusted(),
    onError: (err: Error) => setFormError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    const adj = Number(adjustment);
    if (isNaN(adj)) {
      setFormError('請輸入有效的數字');
      return;
    }

    mutation.mutate();
  }

  const previewFinal = item.baseAmount + item.travelExpenses + Number(adjustment || 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Settings2 size={18} className="text-[var(--color-primary)]" />
            <h3 className="text-base font-semibold text-slate-800">調整薪資</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">

            {/* 目前資訊 */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">師傅</span>
                <span className="text-slate-700 font-medium">{item.workerNickname}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">案件</span>
                <span className="text-slate-700 font-mono">{item.projectCode || '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">底薪</span>
                <span className="text-slate-700">{fmt(item.baseAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">車馬費</span>
                <span className="text-slate-700">{fmt(item.travelExpenses)}</span>
              </div>
            </div>

            {/* 調整金額 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                調整金額 <span className="text-[10px] text-slate-400">（正數加薪、負數扣款）</span>
              </label>
              <input
                type="number"
                value={adjustment}
                onChange={e => setAdjustment(e.target.value)}
                placeholder="0"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-shadow"
              />
            </div>

            {/* 備註 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                備註 <span className="text-[10px] text-slate-400">（選填）</span>
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="例：加班費、代墊材料費..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-shadow resize-none"
              />
            </div>

            {/* 預覽 */}
            <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3 border border-blue-100">
              <span className="text-xs text-blue-600">調整後實領</span>
              <span className="text-sm font-bold text-blue-800">{fmt(previewFinal)}</span>
            </div>

            {/* 錯誤 */}
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
                  儲存中...
                </>
              ) : (
                '確認調整'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
