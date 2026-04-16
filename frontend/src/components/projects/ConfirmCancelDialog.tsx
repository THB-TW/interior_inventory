import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelProject } from '@/services/projectService';
import type { Project } from '@/types/project';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmCancelDialogProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
}

/**
 * 取消案件二次確認 Dialog
 * 呼叫 DELETE /api/projects/{id} 進行軟刪除，成功後讓列表快取失效
 */
export default function ConfirmCancelDialog({
  open,
  project,
  onClose,
}: ConfirmCancelDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => cancelProject(project!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
  });

  if (!open || !project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={16} />
            <span className="text-sm font-semibold">確認取消案件</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-[var(--color-text-muted)]">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            確定要取消案件{' '}
            <span className="font-semibold text-[var(--color-text-primary)]">
              {project.caseCode}
            </span>{' '}
            嗎？
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            客戶：{project.clientName}
          </p>
          <p className="text-xs text-amber-600 mt-2 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
            此操作將案件狀態改為「已取消」，無法直接復原。
          </p>

          {mutation.isError && (
            <p className="text-xs text-red-500 mt-2">
              {mutation.error instanceof Error
                ? mutation.error.message
                : '操作失敗，請稍後再試'}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-gray-50"
          >
            取消
          </button>
          <button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="h-9 px-5 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            確認取消案件
          </button>
        </div>
      </div>
    </div>
  );
}
