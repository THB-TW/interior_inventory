import type { ProjectStatus } from '@/types/project';

export interface Worker {
  id: number;
  nickname: string;
  dailyWage: number;
}

export interface WorkerRequest {
  nickname: string;
  dailyWage: number;
}

// 對應後端 CaseWorkerResponse
export interface CaseWorkerRow {
  id: number;
  workerId: number | null;      // nullable，未綁定名單時為 null
  workerName: string | null;    // worker 被刪時為 null
  dailyWage: number;
  workday: string;              // ISO date "2025-04-01"
  travelExpenses: number;
}

// 對應後端 WorkerProjectSummary
export interface WorkerProjectSummary {
  projectId: number;
  projectCode: string;
  clientName: string;
  address: string;
  status: ProjectStatus;
  totalWorkdays: number;
  totalWage: number;
  totalTravel: number;
  totalWorkerCost: number;
  workers: CaseWorkerRow[];
}

export interface CaseWorkerRequest {
  workerId: number | null;
  dailyWage: number;
  workday: string;             // ISO date "2025-04-01"
  workdayEnd?: string;            // ISO date "2025-04-01"
  travelExpenses: number;
}