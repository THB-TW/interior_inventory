import type { Project } from '@/types/project';
import { ProjectStatus } from '@/types/project';
import StatusBadge from '@/components/common/StatusBadge';
import { ChevronRight, Ban, Pencil, Loader2, FolderOpen, AlertCircle } from 'lucide-react';

interface ProjectCardListProps {
  data: Project[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onCancel: (project: Project) => void;
}

/**
 * 手機版案件卡片列表（取代桌面表格）
 * 每一張卡片顯示核心資訊，右側有操作按鈕
 */
export default function ProjectCardList({
  data,
  isLoading,
  isError,
  errorMessage,
  onView,
  onEdit,
  onCancel,
}: ProjectCardListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin mb-3" />
        <p className="text-sm">載入中...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500 px-6 text-center">
        <AlertCircle size={28} className="mb-3" />
        <p className="text-sm font-medium">載入失敗</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          {errorMessage ?? '請確認後端服務是否正常'}
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)] px-6 text-center">
        <FolderOpen size={32} className="mb-3 opacity-40" />
        <p className="text-sm">暫無案件資料</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--color-border)]">
      {data.map((project) => (
        <div
          key={project.id}
          className="p-4 active:bg-gray-50 transition-colors"
          onClick={() => onView(project)}
        >
          <div className="flex items-start justify-between gap-3">
            {/* 左側主要資訊 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <StatusBadge status={project.status} />
                <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                  {project.caseCode}
                </span>
              </div>

              <p className="font-semibold text-[var(--color-text-primary)] text-sm leading-snug">
                {project.clientName}
              </p>

              {project.clientPhone && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  📞 {project.clientPhone}
                </p>
              )}

              <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">
                📍 {[project.city, project.district, project.addressLine].filter(Boolean).join('')}
              </p>

              <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
                {new Date(project.createdAt).toLocaleDateString('zh-TW')} 建立
              </p>
            </div>

            {/* 右側操作 */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <ChevronRight size={16} className="text-[var(--color-text-muted)]" />

              <div className="flex items-center gap-1 mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                  className="p-2 rounded-lg bg-gray-100 text-[var(--color-text-secondary)] active:bg-gray-200 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                {project.status !== ProjectStatus.CANCELLED && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onCancel(project); }}
                    className="p-2 rounded-lg bg-red-50 text-red-500 active:bg-red-100 transition-colors"
                  >
                    <Ban size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
