import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { InventoryStatus, InventoryStatusConfig } from '@/types/inventory';
import type { WarehouseInventoryRequest, WarehouseInventory } from '@/types/inventory';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient'

interface Material {
  id: number;
  name: string;
  unit: string;
}

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WarehouseInventoryRequest) => void;
  initialData?: WarehouseInventory | null;
  isSubmitting?: boolean;
}

export default function InventoryFormModal({ isOpen, onClose, onSubmit, initialData, isSubmitting }: InventoryFormModalProps) {
  const [formData, setFormData] = useState<WarehouseInventoryRequest>({
    materialId: 0,
    quantity: 0,
    location: '',
    status: InventoryStatus.IN_STORAGE,
    remarks: '',
  });

  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      // Assuming a generic material endpoint exists or fallback to static list if not
      try {
        const response = await apiClient.get<Material[]>('/api/materials');
        return response.data || [];
      } catch (e) {
        // Fallback for demo purposes if endpoint doesn't exist
        return [
          { id: 1, name: '日本進口防水漆', unit: '桶' },
          { id: 2, name: '台製防潮角材', unit: '根' },
          { id: 3, name: '不鏽鋼螺絲 (2吋)', unit: '包' }
        ];
      }
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        materialId: initialData.materialId,
        quantity: initialData.quantity,
        location: initialData.location || '',
        status: initialData.status,
        remarks: initialData.remarks || '',
      });
    } else {
      setFormData({
        materialId: materials?.[0]?.id || 0,
        quantity: 0,
        location: '',
        status: InventoryStatus.AVAILABLE,
        remarks: '',
      });
    }
  }, [initialData, isOpen, materials]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? '編輯庫存' : '新增庫存'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">材料</label>
            <select
              value={formData.materialId}
              onChange={(e) => setFormData({ ...formData, materialId: Number(e.target.value) })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              required
              disabled={!!initialData} // 編輯時通常不改材料
            >
              <option value={0} disabled>選擇材料...</option>
              {materials?.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">數量</label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">狀態</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as InventoryStatus })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              >
                {Object.values(InventoryStatus).map(status => (
                  <option key={status} value={status}>{InventoryStatusConfig[status as InventoryStatus].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">儲位</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              placeholder="例如: A 區架上"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">備註</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              rows={3}
              placeholder="例如: 剩 20cm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-[var(--color-primary)] hover:bg-opacity-90 rounded-lg transition-colors flex items-center gap-2"
              disabled={isSubmitting || !formData.materialId}
            >
              {isSubmitting ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
