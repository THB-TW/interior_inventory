import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectById, updateProjectStatus } from '@/services/projectService';
import {
  ProjectStatus,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_TRANSITIONS,
} from '@/types/project';
import StatusBadge from '@/components/common/StatusBadge';
import { X, MapPin, Phone, User, Calendar, ArrowRight, Loader2, Package, FileText, DollarSign } from 'lucide-react';

interface ProjectDetailDrawerProps {
  projectId: number | null;  // null 代表關閉
  onClose: () => void;
  onEdit: () => void;
}

// ── 小工具：資訊列 ─────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-[var(--color-text-secondary)]" />
      </div>
      <div>
        <p className="text-[11px] text-[var(--color-text-muted)] leading-none mb-0.5">{label}</p>
        <p className="text-sm text-[var(--color-text-primary)]">{value || '—'}</p>
      </div>
    </div>
  );
}

// ── 佔位未來功能的區塊 ─────────────────────────────────────────
function PlaceholderSection({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="border border-dashed border-[var(--color-border)] rounded-lg p-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[var(--color-text-muted)]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
      </div>
    </div>
  );
}

export default function ProjectDetailDrawer({ projectId, onClose, onEdit }: ProjectDetailDrawerProps) {
  const queryClient = useQueryClient();
  const isOpen = projectId !== null;

  // 查詢單一案件詳情
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId!),
    enabled: isOpen,
  });

  // 狀態流轉 Mutation
  const statusMutation = useMutation({
    mutationFn: (nextStatus: ProjectStatus) =>
      updateProjectStatus(projectId!, nextStatus),
    onSuccess: () => {
      // 同時讓列表快取與詳情快取都失效，兩者都會自動重新整理
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  // 計算此案件下一步可流轉到哪些狀態
  const nextStatuses = project
    ? PROJECT_STATUS_TRANSITIONS[project.status] ?? []
    : [];

  return (
    <>
      {/* 半透明遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Drawer 本體：從右側滑入 */}
      <aside
        className={`fixed top-0 right-0 h-full w-[420px] bg-white border-l border-[var(--color-border)] z-50 flex flex-col shadow-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── Header ───────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">案件詳情</p>
            <p className="text-base font-semibold text-[var(--color-text-primary)]">
              {project?.caseCode ?? '—'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              disabled={!project}
              className="h-8 px-3 rounded-md border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              編輯
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-100 text-[var(--color-text-muted)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── 主體：可捲動 ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
            </div>
          ) : project ? (
            <div className="p-5 flex flex-col gap-5">

              {/* 狀態區塊 */}
              <section>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">目前狀態</p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={project.status} />
                  {project.estimatedDays && (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      預計工期 {project.estimatedDays} 天
                    </span>
                  )}
                </div>

                {/* 狀態流轉按鈕 */}
                {nextStatuses.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-[11px] text-[var(--color-text-muted)]">可推進至：</p>
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses.map((next) => (
                        <button
                          key={next}
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate(next)}
                          className="flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-colors disabled:opacity-50"
                        >
                          {statusMutation.isPending
                            ? <Loader2 size={12} className="animate-spin" />
                            : <ArrowRight size={12} />
                          }
                          {PROJECT_STATUS_LABELS[next]}
                        </button>
                      ))}
                    </div>
                    {statusMutation.isError && (
                      <p className="text-xs text-red-500">
                        {statusMutation.error instanceof Error
                          ? statusMutation.error.message
                          : '狀態變更失敗'}
                      </p>
                    )}
                  </div>
                )}
              </section>

              <hr className="border-[var(--color-border)]" />

              {/* 客戶資訊 */}
              <section className="flex flex-col gap-3">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">客戶資訊</p>
                <InfoRow icon={User} label="客戶姓名" value={project.clientName} />
                <InfoRow icon={Phone} label="聯絡電話" value={project.clientPhone} />
              </section>

              <hr className="border-[var(--color-border)]" />

              {/* 施工地址 */}
              <section className="flex flex-col gap-3">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">施工地址</p>
                <InfoRow
                  icon={MapPin}
                  label="完整地址"
                  value={[project.city, project.district, project.addressLine].filter(Boolean).join('')}
                />
              </section>

              <hr className="border-[var(--color-border)]" />

              {/* 時間資訊 */}
              <section className="flex flex-col gap-3">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">時間記錄</p>
                <InfoRow
                  icon={Calendar}
                  label="建立日期"
                  value={new Date(project.createdAt).toLocaleString('zh-TW')}
                />
                <InfoRow
                  icon={Calendar}
                  label="最後更新"
                  value={new Date(project.updatedAt).toLocaleString('zh-TW')}
                />
              </section>

              <hr className="border-[var(--color-border)]" />

              {/* 未來功能預留區 */}
              <section className="flex flex-col gap-2">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1">擴充功能（開發中）</p>
                <PlaceholderSection icon={FileText} title="報價版本" desc="查看此案件的報價歷程與定稿版本" />
                <PlaceholderSection icon={Package} title="材料清單" desc="本案使用的材料品項與數量" />
                <PlaceholderSection icon={DollarSign} title="費用結算" desc="工程費用、材料費、師傅工資統計" />
              </section>

            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
