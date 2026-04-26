import type { Worker, WorkerRequest, WorkerProjectSummary, CaseWorkerRow, CaseWorkerRequest } from '@/types/worker';
import apiClient from '@/lib/apiClient';

const WORKER_BASE = '/workers';
const CASE_WORKER_BASE = '/caseworkers';

export async function getWorkers(): Promise<Worker[]> {
  const response = await apiClient.get<Worker[]>(WORKER_BASE);
  return (response.data || []) as Worker[];
}

export async function getCaseWorkers(caseId: number): Promise<CaseWorkerRow[]> {
  const response = await apiClient.get<CaseWorkerRow[]>(
    `${CASE_WORKER_BASE}/${caseId}/workers`,
  );
  return (response.data || []) as CaseWorkerRow[];
}

export async function createWorker(payload: WorkerRequest): Promise<Worker> {
  const response = await apiClient.post<Worker>(WORKER_BASE, payload);
  return response.data;
}

export async function updateWorker(id: number, payload: WorkerRequest): Promise<Worker> {
  const response = await apiClient.put<Worker>(`${WORKER_BASE}/${id}`, payload);
  return response.data;
}

export async function deleteWorker(id: number): Promise<void> {
  await apiClient.delete(`${WORKER_BASE}/${id}`);
}

// ── 新增：case_workers 施工紀錄 ───────────────────────────────

export async function getWorkerOverview(): Promise<WorkerProjectSummary[]> {
  const response = await apiClient.get<WorkerProjectSummary[]>(CASE_WORKER_BASE);
  return (response.data || []) as WorkerProjectSummary[];
}

export async function createCaseWorker(
  caseId: number,
  payload: CaseWorkerRequest,
): Promise<CaseWorkerRow[]> {          // ← 改成陣列
  const response = await apiClient.post<CaseWorkerRow[]>(   // ← 改成陣列
    `${CASE_WORKER_BASE}/${caseId}/workers`,
    payload,
  );
  return response.data;
}

export async function updateCaseWorker(
  caseId: number,
  caseWorkerId: number,
  payload: CaseWorkerRequest,
): Promise<CaseWorkerRow> {
  const response = await apiClient.put<CaseWorkerRow>(
    `${CASE_WORKER_BASE}/${caseId}/workers/${caseWorkerId}`,
    payload,
  );
  return response.data;
}

export async function deleteCaseWorker(caseId: number, caseWorkerId: number): Promise<void> {
  await apiClient.delete(`${CASE_WORKER_BASE}/${caseId}/workers/${caseWorkerId}`);
}
