import type { Worker, WorkerRequest } from '@/types/worker';
import type { ApiResponse } from '@/types/project';

const API_BASE_URL = '/api/workers';

export async function getWorkers(): Promise<Worker[]> {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error('無法取得師傅列表');
  }
  const result: ApiResponse<Worker[]> = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data || [];
}

export async function createWorker(request: WorkerRequest): Promise<Worker> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error('無法新增師傅');
  }
  const result: ApiResponse<Worker> = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data!;
}
