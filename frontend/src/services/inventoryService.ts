import axios from 'axios';
import type { WarehouseInventory } from '@/types/inventory';
import type { ApiResponse } from '@/types/project';

const API_URL = '/api/inventory';

export const inventoryService = {
  getAllInventory: async (): Promise<WarehouseInventory[]> => {
    const response = await axios.get<ApiResponse<WarehouseInventory[]>>(API_URL);
    return response.data.data || [];
  },
};
