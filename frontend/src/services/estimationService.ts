import type { ProjectEstimation, ProjectEstimationSaveRequest } from '@/types/estimation';
import type { ApiResponse } from '@/types/project';
import axios from 'axios';

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

export interface EstimationSavePayload {
  items: { materialName: string; quantity: number; unitPrice: number }[];
  workerItems: { workerId: number; days: number }[];
  profit: number;
}

export const saveEstimation = async (
  projectId: number,
  payload: EstimationSavePayload
): Promise<void> => {
  await axios.put(`/api/projects/${projectId}/estimation`, payload);
};
