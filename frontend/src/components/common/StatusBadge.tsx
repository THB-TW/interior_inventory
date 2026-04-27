import clsx from 'clsx';

// 結合專案與薪資的所有可能狀態
export type BadgeStatus =
  // Project Status
  | 'INQUIRY' | 'QUOTING' | 'CONFIRMED' | 'IN_PROGRESS' | 'INSPECTION' | 'CLOSED' | 'CANCELLED'
  // Salary Status (CONFIRMED 兩邊共用)
  | 'PENDING' | 'PAID'
  // 允許傳入其他字串，增加元件彈性
  | string;

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config: Record<string, { label: string; className: string }> = {
    // --- 專案狀態 (ProjectStatus) ---
    INQUIRY: { label: '詢問中', className: 'bg-slate-100 text-slate-700 border border-slate-200' },
    QUOTING: { label: '報價中', className: 'bg-purple-100 text-purple-700 border border-purple-200' },
    IN_PROGRESS: { label: '施工中', className: 'bg-orange-100 text-orange-700 border border-orange-200' },
    INSPECTION: { label: '驗收中', className: 'bg-teal-100 text-teal-700 border border-teal-200' },
    CLOSED: { label: '已結案', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    CANCELLED: { label: '已取消', className: 'bg-red-100 text-red-700 border border-red-200' },

    // --- 共用狀態 ---
    CONFIRMED: { label: '已確認', className: 'bg-blue-100 text-blue-700 border border-blue-200' },

    // --- 薪資專用狀態 (SalaryStatus) ---
    PENDING: { label: '待確認', className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    PAID: { label: '已結清', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },

    // --- 對帳單 invoice status ---
    PENDING_REVIEW: { label: '待確認', className: 'bg-amber-100 text-amber-700 border border-amber-200' },

    // --- 對帳單比對結果 ---
    OK: { label: '吻合', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    QTY_MISMATCH: { label: '數量異常', className: 'bg-red-100 text-red-700 border border-red-200' },
    PRICE_MISMATCH: { label: '單價異常', className: 'bg-red-100 text-red-700 border border-red-200' },
    NOT_FOUND_IN_SYS: { label: '未登錄', className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    NOT_FOUND_IN_PDF: { label: '未出現', className: 'bg-slate-100 text-slate-500 border border-slate-200' },
  };

  // 如果傳入的狀態找不到對應，就直接顯示該文字並套用預設樣式
  const currentConfig = config[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-700 border border-slate-200'
  };

  return (
    <span className={clsx('px-2.5 py-1 rounded-md text-xs font-bold tracking-wide', currentConfig.className, className)}>
      {currentConfig.label}
    </span>
  );
}