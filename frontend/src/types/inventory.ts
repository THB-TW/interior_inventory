export const InventoryStatus = {
  AVAILABLE: 'AVAILABLE',
  IN_STORAGE: 'IN_STORAGE',
  IN_USE: 'IN_USE',
} as const;

export type InventoryStatus = keyof typeof InventoryStatus;

export const InventoryStatusConfig = {
  [InventoryStatus.AVAILABLE]: { label: '可用', color: 'text-green-700 bg-green-50 border-green-200' },
  [InventoryStatus.IN_STORAGE]: { label: '儲存中', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  [InventoryStatus.IN_USE]: { label: '已被使用', color: 'text-slate-700 bg-slate-100 border-slate-200' },
};

export interface WarehouseInventory {
  id: number;
  materialId: number;
  materialName: string;
  materialUnit: string;
  quantity: number;
  location: string;
  status: InventoryStatus;
  remarks: string;
  updatedAt: string;
}
