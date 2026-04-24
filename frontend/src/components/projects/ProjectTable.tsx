import type { Project } from '@/types/project';
import { ProjectStatus } from '@/types/project';
import StatusBadge from '@/components/common/StatusBadge';
import { Eye, Pencil, Loader2, FolderOpen, AlertCircle, Ban } from 'lucide-react';

interface ProjectTableProps {
  data: Project[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onCancel: (project: Project) => void;
}

/**
 * 案件資料表格
 * Props:
 *   data         - 當頁的案件陣列
 *   isLoading    - 是否正在載入
 *   isError      - 是否發生錯誤
 *   errorMessage - 錯誤訊息文字
 *   onView       - 點擊「查看」按鈕的回呼
 *   onEdit       - 點擊「編輯」按鈕的回呼
 */
export default function ProjectTable({
  data,
  isLoading,
  isError,
  errorMessage,
  onView,
  onEdit,
  onCancel,
}: ProjectTableProps) {
  // ── Loading 狀態 ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[var(--color-text-muted)]">
        <Loader2 size={28} className="animate-spin mb-3" />
        <p className="text-sm">載入案件資料中...</p>
      </div>
    );
  }

  // ── Error 狀態 ────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-red-500">
        <AlertCircle size={28} className="mb-3" />
        <p className="text-sm font-medium">載入失敗</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          {errorMessage ?? '無法取得案件資料，請確認後端服務是否正常運作。'}
        </p>
      </div>
    );
  }

  // ── Empty 狀態 ────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[var(--color-text-muted)]">
        <FolderOpen size={32} className="mb-3 opacity-40" />
        <p className="text-sm">暫無案件資料</p>
        <p className="text-xs mt-1">請嘗試調整篩選條件，或新增第一筆案件。</p>
      </div>
    );
  }

  // ── 正常資料表格 ──────────────────────────────────────────
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-gray-50/60">
            <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] whitespace-nowrap">
              案號
            </th>
            <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] whitespace-nowrap">
              客戶姓名
            </th>
            <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] whitespace-nowrap">
              聯絡電話
            </th>
            <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] whitespace-nowrap">
              施工地址
            </th>
            <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] whitespace-nowrap">
              狀態
            </th>
            <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] whitespace-nowrap">
              預計天數
            </th>
            <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] whitespace-nowrap">
              建立日期
            </th>
            <th className="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)] whitespace-nowrap">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {data.map((project) => (
            <tr
              key={project.id}
              className="hover:bg-gray-50/50 transition-colors group"
            >
              <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                {project.caseCode}
              </td>
              <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                {project.clientName}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                {project.clientPhone || '—'}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-[200px] truncate">
                {[project.city, project.district, project.addressLine]
                  .filter(Boolean)
                  .join('')}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={project.status} />
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                {project.estimatedDays != null
                  ? `${project.estimatedDays} 天`
                  : <span className="text-[var(--color-text-muted)] text-xs">未填寫</span>}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                {new Date(project.createdAt).toLocaleDateString('zh-TW')}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onView(project)}
                    title="查看詳情"
                    className="p-1.5 rounded hover:bg-gray-100 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => onEdit(project)}
                    title="編輯案件"
                    className="p-1.5 rounded hover:bg-gray-100 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  {project.status !== ProjectStatus.CANCELLED && (
                    <button
                      onClick={() => onCancel(project)}
                      title="取消案件"
                      className="p-1.5 rounded hover:bg-gray-100 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
                    >
                      <Ban size={15} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
