import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, DollarSign, Calendar, Save, Loader2, Briefcase, PieChart as PieChartIcon } from 'lucide-react';
import { previewBonus, confirmBonus } from '@/services/bonusService';
import type { BonusConfirmRequest, BonusItemRequest } from '@/types/bonus';

// 擴充表單明細型別，加上前端顯示用的 workerName
interface FormItem extends BonusItemRequest {
  workerName: string;
}

// React Hook Form 狀態結構
interface BonusFormValues {
  startDate: string;
  endDate: string;
  label: string;
  dailyRate: number;
  items: FormItem[];
}

// Recharts 圓餅圖配色
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function DashboardPage() {
  // ==========================================
  // 1. 營運資金健康度 (暫用假資料)
  // ==========================================
  const dummyCashFlow = {
    pendingIncome: 1250000,
    pendingMaterial: 300000,
    pendingSalary: 150000,
    cashFlowBuffer: 800000,
    isHealthy: true, // 改為 false 看看紅燈警告效果！
  };

  // ==========================================
  // 2. 表單狀態管理 (React Hook Form)
  // ==========================================
  const { register, control, handleSubmit, watch, setValue } = useForm<BonusFormValues>({
    defaultValues: {
      startDate: dayjs().startOf('year').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('year').format('YYYY-MM-DD'),
      label: `${dayjs().year()}年度 節慶獎金`,
      dailyRate: 100,
      items: [],
    },
  });

  // 管理動態表格陣列
  const { fields } = useFieldArray({ control, name: 'items' });

  // 監聽上方三個關鍵參數，用來觸發 API 重新撈取
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const dailyRate = watch('dailyRate');
  // 監聽整個明細陣列，用來即時計算總額
  const items = watch('items');

  // ==========================================
  // 3. API 預覽與資料同步 (React Query)
  // ==========================================
  const { data: previewData, isLoading, isError } = useQuery({
    queryKey: ['bonusPreview', startDate, endDate, dailyRate],
    queryFn: () => previewBonus(startDate, endDate, dailyRate || 0),
    // 確保必填欄位都有值才發送 API
    enabled: !!startDate && !!endDate && dailyRate > 0,
  });

  // 當預覽資料回來時，同步寫入到 Form 的 items 中
  useEffect(() => {
    if (previewData) {
      const newItems = previewData.map((item) => ({
        workerId: item.workerId,
        workerName: item.workerName,
        totalDays: item.totalDays,
        calculatedAmount: item.calculatedAmount,
        actualAmount: item.calculatedAmount, // 預設帶入系統試算金額
      }));
      setValue('items', newItems);
    }
  }, [previewData, setValue]);

  // ==========================================
  // 4. 即時計算總額與 API 提交
  // ==========================================
  const totalActualAmount = items.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0);
  const totalCalculatedAmount = items.reduce((sum, item) => sum + (Number(item.calculatedAmount) || 0), 0);

  const mutation = useMutation({
    mutationFn: (data: BonusConfirmRequest) => confirmBonus(data),
    onSuccess: () => {
      alert('獎金發放紀錄已成功儲存！');
    },
    onError: (err) => {
      alert('儲存失敗，請檢查網路狀態');
      console.error(err);
    }
  });

  const onSubmit = (data: BonusFormValues) => {
    if (!window.confirm('確定要發放並儲存這筆獎金紀錄嗎？')) return;

    // 將表單資料轉換回後端要的 BonusConfirmRequest 格式
    const payload: BonusConfirmRequest = {
      startDate: data.startDate,
      endDate: data.endDate,
      label: data.label,
      dailyRate: data.dailyRate,
      items: data.items.map(i => ({
        workerId: i.workerId,
        totalDays: i.totalDays,
        calculatedAmount: i.calculatedAmount,
        actualAmount: Number(i.actualAmount), // 確保轉為數字
      })),
    };

    mutation.mutate(payload);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-800">

      {/* 區塊 1: 營運資金健康度 (Cash Flow Indicator) */}
      <section className={clsx(
        "rounded-2xl p-6 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-colors",
        dummyCashFlow.isHealthy ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
      )}>
        <div className="flex items-center gap-4">
          <div className={clsx(
            "p-4 rounded-full",
            dummyCashFlow.isHealthy ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          )}>
            {dummyCashFlow.isHealthy ? <CheckCircle2 size={36} /> : <AlertCircle size={36} />}
          </div>
          <div>
            <h2 className="text-xl font-bold">營運資金健康度預測</h2>
            <p className={clsx(
              "mt-1 text-sm font-medium",
              dummyCashFlow.isHealthy ? "text-emerald-700" : "text-red-700"
            )}>
              {dummyCashFlow.isHealthy
                ? "🟢 目前資金水位健康，足以支應前期墊款。"
                : "🔴 警告：近期資金可能有缺口，接新案需留意業主前金比例！"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full md:w-auto mt-4 md:mt-0 text-center md:text-right">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">待收工程款</span>
            <span className="text-lg font-bold text-slate-700">${dummyCashFlow.pendingIncome.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">待付材料款</span>
            <span className="text-lg font-bold text-red-500">-${dummyCashFlow.pendingMaterial.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">待付人工款</span>
            <span className="text-lg font-bold text-red-500">-${dummyCashFlow.pendingSalary.toLocaleString()}</span>
          </div>
          <div className="flex flex-col border-l-2 pl-4 border-slate-200 md:border-l-0 md:pl-0 md:border-l-transparent">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">資金緩衝水位</span>
            <span className={clsx(
              "text-2xl font-black",
              dummyCashFlow.isHealthy ? "text-emerald-600" : "text-red-600"
            )}>
              ${dummyCashFlow.cashFlowBuffer.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* 區塊 2: 節慶獎金工作區 (Bonus Management) */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="text-indigo-500" size={24} />
            年度出勤與節慶獎金管理
          </h2>
          <p className="text-sm text-slate-500 mt-1">根據師傅區間出勤天數自動套用基準，微調後直接將最終名單固化入庫。</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* 表單參數設定區 */}
          <div className="flex flex-wrap gap-4 items-end mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-slate-600">獎金標籤名稱</label>
              <input
                {...register('label', { required: true })}
                placeholder="例如：2026 端午節獎金"
                className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">統計起始日</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  {...register('startDate', { required: true })}
                  className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">統計結束日</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  {...register('endDate', { required: true })}
                  className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">每日基準 ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  {...register('dailyRate', { required: true, valueAsNumber: true })}
                  className="pl-9 pr-4 py-2 w-32 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* 圖表與表格雙欄佈局 */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
          ) : isError ? (
            <div className="text-center py-10 text-red-500 font-medium bg-red-50 rounded-xl border border-red-100">
              無法取得資料，請檢查區間設定或網路狀態。
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              該區間內沒有任何師傅出勤紀錄。
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* 區塊 A: 出勤佔比圓餅圖 (佔 1/3) */}
              <div className="lg:col-span-1 bg-white border border-slate-100 rounded-xl shadow-sm p-4 flex flex-col">
                <h3 className="text-base font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <PieChartIcon className="text-slate-400" size={18} />
                  核心戰力佔比 (出勤天數)
                </h3>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={previewData}
                        dataKey="totalDays"
                        nameKey="workerName"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        labelLine={false}
                        label={({ name, percent }: { name?: string | number; percent?: number }) =>
                          `${name || '未知'} ${((percent || 0) * 100).toFixed(0)}%`
                        }
                      >
                        {previewData?.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} 天`, name]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 區塊 B: 獎金微調表單 (佔 2/3) */}
              <div className="lg:col-span-2 flex flex-col">
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                      <tr>
                        <th className="px-4 py-3">師傅姓名</th>
                        <th className="px-4 py-3 text-right">出勤總天數</th>
                        <th className="px-4 py-3 text-right">系統試算 ($)</th>
                        <th className="px-4 py-3 text-right w-40">實際核發微調 ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fields.map((field, index) => (
                        <tr key={field.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {field.workerName}
                            {/* 隱藏欄位確保資料跟著表單一起送出 */}
                            <input type="hidden" {...register(`items.${index}.workerId`)} />
                            <input type="hidden" {...register(`items.${index}.totalDays`)} />
                            <input type="hidden" {...register(`items.${index}.calculatedAmount`)} />
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            {field.totalDays} 天
                          </td>
                          <td className="px-4 py-3 text-right text-slate-400 font-medium">
                            {Number(field.calculatedAmount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="relative inline-block">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={14} />
                              <input
                                type="number"
                                min="0"
                                {...register(`items.${index}.actualAmount`, { required: true, min: 0 })}
                                className="w-full pl-8 pr-3 py-1.5 text-right font-bold text-slate-700 bg-white border border-slate-300 rounded outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan={2} className="px-4 py-4 font-bold text-slate-700 text-right">
                          發放總計
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-slate-400">
                          ${totalCalculatedAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right text-lg font-black text-indigo-600">
                          ${totalActualAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg shadow-sm transition-all active:scale-95"
                  >
                    {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {mutation.isPending ? '寫入中...' : '確認發放並儲存'}
                  </button>
                </div>

              </div>
            </div>
          )}
        </form>
      </section>

    </div>
  );
}