import type { ProjectEstimation, ProjectEstimationSaveRequest } from '@/types/estimation';
import type { ApiResponse } from '@/types/project';

const API_BASE_URL = '/api/projects';

export async function getEstimation(projectId: number): Promise<ProjectEstimation | null> {
  const response = await fetch(`${API_BASE_URL}/${projectId}/estimation`);
  if (!response.ok) {
    throw new Error('無法取得估價資訊');
  }
  const result: ApiResponse<ProjectEstimation | null> = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
}

export async function saveEstimation(projectId: number, request: ProjectEstimationSaveRequest): Promise<ProjectEstimation> {
  const response = await fetch(`${API_BASE_URL}/${projectId}/estimation`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error('儲存估價失敗');
  }
  const result: ApiResponse<ProjectEstimation> = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data!;
}
