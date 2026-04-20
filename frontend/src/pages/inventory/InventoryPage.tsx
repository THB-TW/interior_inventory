import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PackageSearch, Boxes, AlertCircle, Search, Filter, Plus, Lightbulb, Edit, Trash2 } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';
import { InventoryStatus, InventoryStatusConfig } from '@/types/inventory';
import type { WarehouseInventory, WarehouseInventoryRequest } from '@/types/inventory';
import dayjs from 'dayjs';
import InventoryFormModal from '@/components/inventory/InventoryFormModal';
import InventorySuggestionsDrawer from '@/components/inventory/InventorySuggestionsDrawer';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | ''>('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseInventory | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: inventoryList, isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getAllInventory,
  });

  const { data: suggestionsList } = useQuery({
    queryKey: ['inventory-suggestions'],
    queryFn: inventoryService.getSuggestions,
    enabled: isDrawerOpen, // Only fetch when drawer opens
  });

  const createMutation = useMutation({
    mutationFn: inventoryService.createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: WarehouseInventoryRequest }) => inventoryService.updateInventory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsFormOpen(false);
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryService.deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const allocateMutation = useMutation({
    mutationFn: ({ inventoryId, projectId }: { inventoryId: number, projectId: number }) => inventoryService.allocateToProject(inventoryId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-suggestions'] });
      // 可以在這裡加個 Toast 提示成功
    },
  });

  const filteredInventory = inventoryList?.filter(item => {
    const matchSearch = item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '' || item.status === statusFilter;
    return matchSearch && matchStatus;
  }) || [];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: WarehouseInventory) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('確定要刪除這筆庫存嗎？')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSubmit = (data: WarehouseInventoryRequest) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-primary)] text-white p-2 rounded-lg">
            <Boxes size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">庫存管理</h1>
            <p className="text-sm text-slate-500">檢視與追蹤各項材料的儲存狀態</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors font-medium border border-amber-200"
          >
            <Lightbulb size={18} className="fill-amber-400" />
            智能媒合
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white hover:bg-opacity-90 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus size={18} />
            新增庫存
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">

        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜尋材料名稱或儲位..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InventoryStatus | '')}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 w-full sm:w-auto justify-center outline-none"
            >
              <option value="">所有狀態</option>
              {Object.values(InventoryStatus).map(status => (
                <option key={status} value={status}>{InventoryStatusConfig[status as InventoryStatus].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data State Handling */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
            <div className="animate-spin text-[var(--color-primary)]"><PackageSearch size={32} /></div>
            <p>載入庫存資料中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center">
            <AlertCircle size={32} className="mb-2 text-red-500" />
            <p className="font-bold mb-1">無法取得庫存資料</p>
            <p className="text-sm">請確認後端服務是否啟動，或是再試一次。</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-500 shadow-sm">
            <PackageSearch size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-600 mb-1">查無庫存結果</p>
            <p className="text-sm">試著更換搜尋條件，或稍後再試。</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                    <th className="font-semibold py-3 px-4 w-[20%] whitespace-nowrap">材料名稱</th>
                    <th className="font-semibold py-3 px-4 w-[10%] whitespace-nowrap">庫存數量</th>
                    <th className="font-semibold py-3 px-4 w-[15%] whitespace-nowrap">儲位</th>
                    <th className="font-semibold py-3 px-4 w-[15%] whitespace-nowrap">狀態</th>
                    <th className="font-semibold py-3 px-4 w-[15%] whitespace-nowrap">備註說明</th>
                    <th className="font-semibold py-3 px-4 w-[15%] whitespace-nowrap">最後更新</th>
                    <th className="font-semibold py-3 px-4 w-[10%] whitespace-nowrap text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3 px-4 font-medium text-slate-900 line-clamp-2">
                        {item.materialName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 font-bold font-mono text-slate-700">
                          {item.quantity} <span className="text-xs text-slate-500 font-sans font-normal">{item.materialUnit}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600 font-medium">
                          {item.location || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${InventoryStatusConfig[item.status].color}`}>
                          {InventoryStatusConfig[item.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {item.remarks ? (
                          <span className="line-clamp-2" title={item.remarks}>{item.remarks}</span>
                        ) : (
                          <span className="text-slate-300 italic">無備註</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                        {dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 text-slate-400 hover:text-[var(--color-primary)] transition-colors"
                            title="編輯"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="刪除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <InventoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <InventorySuggestionsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        suggestions={suggestionsList || []}
        onAllocate={(inventoryId, projectId) => allocateMutation.mutate({ inventoryId, projectId })}
        isAllocating={allocateMutation.isPending}
      />
    </div>
  );
}
