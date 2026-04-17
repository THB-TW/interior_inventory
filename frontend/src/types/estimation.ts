export interface EstimationItem {
  id: number;
  materialName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface EstimationWorkerItem {
  id: number;
  workerId: number;
  days: number;
  subtotal: number;
}

export interface ProjectEstimation {
  id: number;
  projectId: number;
  laborCost: number;
  profit: number;
  totalAmount: number;
  items: EstimationItem[];
  workerItems: EstimationWorkerItem[];
}

export interface EstimationItemSaveRequest {
  materialName: string;
  quantity: number;
  unitPrice: number;
}

export interface EstimationWorkerItemSaveRequest {
  workerId: number;
  days: number; // e.g. 1.5, 0.5
}

export interface ProjectEstimationSaveRequest {
  profit: number;
  items: EstimationItemSaveRequest[];
  workerItems: EstimationWorkerItemSaveRequest[];
}
