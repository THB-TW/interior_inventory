import apiClient from '@/lib/apiClient';
import type {
  Project,
  ProjectListParams,
  CreateProjectRequest,
  UpdateProjectRequest,
  PageResponse,
} from '@/types/project';
import type { ProjectStatus } from '@/types/project';

const BASE = '/projects';

// ── 查詢案件列表（分頁 + 篩選）──────────────────────────────
export async function getProjects(params?: ProjectListParams): Promise<PageResponse<Project>> {
  const response = await apiClient.get<PageResponse<Project>>(BASE, { params });
  return response.data as PageResponse<Project>;
}

// ── 查詢單一案件詳情 ─────────────────────────────────────────
export async function getProjectById(id: number): Promise<Project> {
  const response = await apiClient.get<Project>(`${BASE}/${id}`);
  return response.data as Project;
}

// ── 新增案件 ─────────────────────────────────────────────────
export async function createProject(data: CreateProjectRequest): Promise<Project> {
  const response = await apiClient.post<Project>(BASE, data);
  return response.data as Project;
}

// ── 編輯案件基本資料 ─────────────────────────────────────────
export async function updateProject(id: number, data: UpdateProjectRequest): Promise<Project> {
  const response = await apiClient.put<Project>(`${BASE}/${id}`, data);
  return response.data as Project;
}

// ── 案件狀態流轉 ─────────────────────────────────────────────
export async function updateProjectStatus(id: number, nextStatus: ProjectStatus): Promise<void> {
  await apiClient.patch(`${BASE}/${id}/status`, null, {
    params: { nextStatus },
  });
}

// ── 取消案件（軟刪除）────────────────────────────────────────
export async function cancelProject(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
