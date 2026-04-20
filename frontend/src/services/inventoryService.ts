import apiClient from '@/lib/apiClient';
import type { WarehouseInventory, WarehouseInventoryRequest, InventorySuggestionResponse } from '@/types/inventory';

const API_URL = '/inventory';

export const inventoryService = {
  getAllInventory: async (): Promise<WarehouseInventory[]> => {
    const response = await apiClient.get<WarehouseInventory[]>(API_URL);
    return response.data || [];
  },

  createInventory: async (data: WarehouseInventoryRequest): Promise<WarehouseInventory> => {
    const response = await apiClient.post<WarehouseInventory>(API_URL, data);
    return response.data;
  },

  updateInventory: async (id: number, data: WarehouseInventoryRequest): Promise<WarehouseInventory> => {
    const response = await apiClient.put<WarehouseInventory>(`${API_URL}/${id}`, data);
    return response.data;
  },

  deleteInventory: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_URL}/${id}`);
  },

  getSuggestions: async (): Promise<InventorySuggestionResponse[]> => {
    const response = await apiClient.get<InventorySuggestionResponse[]>(`${API_URL}/suggestions`);
    return response.data || [];
  },

  allocateToProject: async (inventoryId: number, projectId: number): Promise<void> => {
    await apiClient.post(`${API_URL}/${inventoryId}/allocate/${projectId}`);
  },
};
