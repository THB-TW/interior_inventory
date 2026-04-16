import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/services/projectService';
import type { Project, ProjectListParams } from '@/types/project';
import Topbar from '@/components/layout/Topbar';
import ProjectFilters from '@/components/projects/ProjectFilters';
import ProjectTable from '@/components/projects/ProjectTable';
import ProjectCardList from '@/components/projects/ProjectCardList';
import Pagination from '@/components/common/Pagination';
import ProjectFormModal from '@/components/projects/ProjectFormModal';
import ConfirmCancelDialog from '@/components/projects/ConfirmCancelDialog';
import ProjectDetailDrawer from '@/components/projects/ProjectDetailDrawer';
import { Plus } from 'lucide-react';

const DEFAULT_PARAMS: ProjectListParams = {
  page: 0,
  size: 10,
  sort: 'createdAt,desc',
};

export default function ProjectListPage() {
  const [params, setParams] = useState<ProjectListParams>(DEFAULT_PARAMS);

  // Modal 狀態管理
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Project | null>(null);
  const [viewTargetId, setViewTargetId] = useState<number | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
  });

  function handleCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function handleEdit(project: Project) {
    setEditTarget(project);
    setFormOpen(true);
  }

  function handleView(project: Project) {
    setViewTargetId(project.id);
  }

  function handleCancel(project: Project) {
    setCancelTarget(project);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditTarget(null);
  }

  return (
    <>
      <Topbar
        title="案件總覽"
        subtitle="管理所有室內裝潢施工案件"
        actions={
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-accent)] text-white text-sm rounded-md hover:opacity-90 transition-opacity font-medium"
          >
            <Plus size={15} />
            新增案件
          </button>
        }
      />

      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <ProjectFilters
            params={params}
            onChange={(newParams) => setParams(newParams)}
          />
          {data && (
            <span className="text-xs text-[var(--color-text-muted)]">
              共 {data.totalElements} 筆案件
            </span>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        {/* 桌面版：資料表格 (md 以上顯示) */}
          <div className="hidden md:block">
            <ProjectTable
              data={data?.content ?? []}
              isLoading={isLoading}
              isError={isError}
              errorMessage={error instanceof Error ? error.message : undefined}
              onView={handleView}
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
          </div>

          {/* 手機版：Card 列表 (md 以下顯示) */}
          <div className="md:hidden">
            <ProjectCardList
              data={data?.content ?? []}
              isLoading={isLoading}
              isError={isError}
              errorMessage={error instanceof Error ? error.message : undefined}
              onView={handleView}
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
          </div>

          {data && (
            <Pagination
              currentPage={data.number}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              pageSize={data.size}
              onPageChange={(page) => setParams((p) => ({ ...p, page }))}
            />
          )}
        </div>
      </div>

      {/* 新增 / 編輯 Modal */}
      <ProjectFormModal
        open={formOpen}
        editTarget={editTarget}
        onClose={handleFormClose}
      />

      {/* 取消確認 Dialog */}
      <ConfirmCancelDialog
        open={!!cancelTarget}
        project={cancelTarget}
        onClose={() => setCancelTarget(null)}
      />

      {/* 詳情側滑 Drawer */}
      <ProjectDetailDrawer
        projectId={viewTargetId}
        onClose={() => setViewTargetId(null)}
        onEdit={() => {
          // 從 Drawer 開啟編輯 - 但我們沒有 Project 物件，改由 ID 查詢後開啟
          // 簡化做法：關閉 Drawer 並開啟表單 (下方用 viewTargetId 找到對應資料)
          setViewTargetId(null);
          // 開啟編輯時需要 Project 物件，這裡從列表資料找
          const found = data?.content.find((p) => p.id === viewTargetId);
          if (found) { setEditTarget(found); setFormOpen(true); }
        }}
      />
    </>
  );
}
