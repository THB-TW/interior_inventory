import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackageSearch, Boxes, AlertCircle, Search, Filter } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';
import { InventoryStatusConfig } from '@/types/inventory';
import dayjs from 'dayjs';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: inventoryList, isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getAllInventory,
  });

  const filteredInventory = inventoryList?.filter(item => 
    item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-full bg-slate-50">
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
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 w-full sm:w-auto justify-center">
            <Filter size={18} />
            <span className="font-medium text-sm">進階篩選</span>
          </button>
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
                    <th className="font-semibold py-3 px-4 w-[25%] whitespace-nowrap">材料名稱</th>
                    <th className="font-semibold py-3 px-4 w-[10%] whitespace-nowrap">庫存數量</th>
                    <th className="font-semibold py-3 px-4 w-[15%] whitespace-nowrap">儲位</th>
                    <th className="font-semibold py-3 px-4 w-[15%] whitespace-nowrap">狀態</th>
                    <th className="font-semibold py-3 px-4 w-[20%] whitespace-nowrap">備註說明</th>
                    <th className="font-semibold py-3 px-4 w-[15%] whitespace-nowrap">最後更新</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
