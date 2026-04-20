import axios from 'axios';
import type { WarehouseInventory, WarehouseInventoryRequest, InventorySuggestionResponse } from '@/types/inventory';
import type { ApiResponse } from '@/types/project';

const API_URL = '/api/inventory';

export const inventoryService = {
  getAllInventory: async (): Promise<WarehouseInventory[]> => {
    const response = await axios.get<ApiResponse<WarehouseInventory[]>>(API_URL);
    return response.data.data || [];
  },

  createInventory: async (data: WarehouseInventoryRequest): Promise<WarehouseInventory> => {
    const response = await axios.post<ApiResponse<WarehouseInventory>>(API_URL, data);
    return response.data.data!;
  },

  updateInventory: async (id: number, data: WarehouseInventoryRequest): Promise<WarehouseInventory> => {
    const response = await axios.put<ApiResponse<WarehouseInventory>>(`${API_URL}/${id}`, data);
    return response.data.data!;
  },

  deleteInventory: async (id: number): Promise<void> => {
    await axios.delete<ApiResponse<void>>(`${API_URL}/${id}`);
  },

  getSuggestions: async (): Promise<InventorySuggestionResponse[]> => {
    const response = await axios.get<ApiResponse<InventorySuggestionResponse[]>>(`${API_URL}/suggestions`);
    return response.data.data || [];
  },

  allocateToProject: async (inventoryId: number, projectId: number): Promise<void> => {
    await axios.post<ApiResponse<void>>(`${API_URL}/${inventoryId}/allocate/${projectId}`);
  },
};
