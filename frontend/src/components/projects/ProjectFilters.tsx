import { type ProjectListParams, ProjectStatus, PROJECT_STATUS_LABELS } from '@/types/project';
import { Search, X } from 'lucide-react';

interface ProjectFiltersProps {
  params: ProjectListParams;
  onChange: (params: ProjectListParams) => void;
}

/**
 * 案件列表搜尋 / 篩選列
 * Props:
 *   params  - 目前的篩選條件
 *   onChange - 當任一條件改變時，把新的完整 params 往上回傳
 */
export default function ProjectFilters({ params, onChange }: ProjectFiltersProps) {
  const hasFilter =
    !!params.clientName || !!params.city || !!params.district || !!params.status;

  function handleClear() {
    onChange({ page: 0, size: params.size });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 客戶姓名關鍵字搜尋 */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="text"
          placeholder="搜尋客戶姓名..."
          value={params.clientName ?? ''}
          onChange={(e) =>
            onChange({ ...params, clientName: e.target.value, page: 0 })
          }
          className="pl-8 pr-3 h-8 w-44 rounded-md border border-[var(--color-border)] bg-white text-sm outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition"
        />
      </div>

      {/* 縣市篩選 */}
      <input
        type="text"
        placeholder="縣市"
        value={params.city ?? ''}
        onChange={(e) => onChange({ ...params, city: e.target.value, page: 0 })}
        className="h-8 w-28 px-3 rounded-md border border-[var(--color-border)] bg-white text-sm outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition"
      />

      {/* 行政區篩選 */}
      <input
        type="text"
        placeholder="行政區"
        value={params.district ?? ''}
        onChange={(e) =>
          onChange({ ...params, district: e.target.value, page: 0 })
        }
        className="h-8 w-28 px-3 rounded-md border border-[var(--color-border)] bg-white text-sm outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition"
      />

      {/* 狀態下拉篩選 */}
      <select
        value={params.status ?? ''}
        onChange={(e) =>
          onChange({
            ...params,
            status: (e.target.value as ProjectStatus) || undefined,
            page: 0,
          })
        }
        className="h-8 px-2 pr-7 rounded-md border border-[var(--color-border)] bg-white text-sm outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition appearance-none"
      >
        <option value="">所有狀態</option>
        {Object.values(ProjectStatus).map((s) => (
          <option key={s} value={s}>
            {PROJECT_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {/* 清除篩選按鈕（只在有篩選條件時顯示）*/}
      {hasFilter && (
        <button
          onClick={handleClear}
          className="flex items-center gap-1 h-8 px-2.5 rounded-md text-xs text-[var(--color-text-secondary)] border border-[var(--color-border)] bg-white hover:bg-gray-50 transition"
        >
          <X size={12} />
          清除
        </button>
      )}
    </div>
  );
}
