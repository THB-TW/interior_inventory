
import { X, Lightbulb, MapPin, Pickaxe } from 'lucide-react';
import type { InventorySuggestionResponse } from '@/types/inventory';

interface InventorySuggestionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: InventorySuggestionResponse[];
  onAllocate: (inventoryId: number, projectId: number) => void;
  isAllocating: boolean;
}

export default function InventorySuggestionsDrawer({
  isOpen,
  onClose,
  suggestions,
  onAllocate,
  isAllocating
}: InventorySuggestionsDrawerProps) {

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-amber-50">
          <div className="flex items-center gap-2 text-amber-700">
            <Lightbulb size={24} className="fill-amber-400" />
            <h2 className="text-lg font-bold">智能剩料媒合</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {suggestions.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
              <Lightbulb size={48} className="mx-auto text-slate-300 mb-4" />
              <p>目前沒有可用的媒合建議</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                系統分析了目前的「可用」剩料，發現以下案件剛好需要這些材料：
              </p>

              {suggestions.map((suggestion, idx) => (
                <div key={`${suggestion.inventoryId}-${suggestion.projectId}-${idx}`} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>

                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800">{suggestion.materialName}</h3>
                    <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                      庫存 {suggestion.availableQuantity} {suggestion.materialUnit}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Pickaxe size={14} className="text-slate-400" />
                      <span className="font-medium text-[var(--color-primary)]">需求案件：{suggestion.projectName}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-500">
                      <MapPin size={14} className="mt-0.5 text-slate-400 shrink-0" />
                      <span>{suggestion.projectAddress}</span>
                    </div>
                    <div className="text-slate-500 pl-6">
                      預計用量: <span className="font-medium text-slate-700">{suggestion.plannedQuantity} {suggestion.materialUnit}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onAllocate(suggestion.inventoryId, suggestion.projectId)}
                    disabled={isAllocating}
                    className="mt-4 w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium rounded-lg text-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isAllocating ? '處理中...' : '確認使用此剩料'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
