export const WarehouseStatus = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  STORAGE: 'STORAGE',
} as const;

export type WarehouseStatus = keyof typeof WarehouseStatus;

export const WarehouseStatusConfig = {
  [WarehouseStatus.AVAILABLE]: { label: '可用', color: 'text-green-700 bg-green-50 border-green-200' },
  [WarehouseStatus.RESERVED]: { label: '已被標記使用中', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  [WarehouseStatus.STORAGE]: { label: '儲存中', color: 'text-slate-700 bg-slate-100 border-slate-200' },
};

export interface WarehouseInventory {
  id: number;
  materialId: number;
  materialName: string;
  materialUnit: string;
  quantity: number;
  location: string;
  status: WarehouseStatus;
  remarks: string;
  updatedAt: string;
}

export interface WarehouseInventoryRequest {
  materialId: number;
  quantity: number;
  location?: string;
  status: WarehouseStatus;
  remarks?: string;
}

export interface InventorySuggestionResponse {
  inventoryId: number;
  materialId: number;
  materialName: string;
  materialUnit: string;
  availableQuantity: number;
  location: string;
  projectId: number;
  projectName: string;
  projectAddress: string;
  plannedQuantity: number;
}
