export interface Worker {
  id: number;
  nickname: string;
  dailyWage: number;
}

export interface WorkerRequest {
  nickname: string;
  dailyWage: number;
}
