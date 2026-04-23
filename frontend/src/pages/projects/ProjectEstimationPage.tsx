import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getProjectById } from '@/services/projectService';
import { getEstimation, saveEstimation } from '@/services/estimationService';
import { getMaterials } from "@/services/materialService";
import { getWorkers } from '@/services/workerService';
import { ArrowLeft, Plus, Trash2, Save, Loader2, Calculator } from 'lucide-react';
import type { EstimationItemSaveRequest, EstimationWorkerItemSaveRequest } from '@/types/estimation';
import type { MaterialResponse } from "@/types/material";

export default function ProjectEstimationPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [items, setItems] = useState<(EstimationItemSaveRequest & { _key: string })[]>([]);
  const [workerItems, setWorkerItems] = useState<(EstimationWorkerItemSaveRequest & { _key: string })[]>([]);
  const [profit, setProfit] = useState<number>(0);
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);

  useEffect(() => {
    getMaterials().then(setMaterials).catch(console.error);
  }, []);

  // Queries
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
  });

  const { data: workers } = useQuery({
    queryKey: ['workers'],
    queryFn: getWorkers,
  });

  const { data: existingEstimation, isLoading: isEstimationLoading } = useQuery({
    queryKey: ['estimation', projectId],
    queryFn: () => getEstimation(projectId),
    enabled: !!projectId,
  });

  // Load existing data
  useEffect(() => {
    if (existingEstimation) {
      setItems(existingEstimation.items.map(item => ({ ...item, _key: Math.random().toString(36) })));
      setWorkerItems(existingEstimation.workerItems.map(item => ({ ...item, _key: Math.random().toString(36) })));
      setProfit(existingEstimation.profit);
    } else if (!isEstimationLoading) {
      if (items.length === 0) {
        setItems([{ materialName: '', quantity: 1, unitPrice: 0, _key: Math.random().toString(36) }]);
      }
    }
  }, [existingEstimation, isEstimationLoading]);

  // Calculations
  const materialsTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const laborTotal = useMemo(() => {
    if (!workers) return 0;
    return workerItems.reduce((sum, item) => {
      const worker = workers.find(w => w.id === item.workerId);
      if (!worker) return sum;
      return sum + (item.days * worker.dailyWage);
    }, 0);
  }, [workerItems, workers]);

  const grandTotal = materialsTotal + laborTotal + (profit || 0);

  // 只顯示啟用中的材料
  const activeMaterials = materials.filter(m => m.isActive);

  // Handlers
  const addMaterial = () => setItems([...items, { materialName: '', quantity: 1, unitPrice: 0, _key: Math.random().toString(36) }]);
  const removeMaterial = (index: number) => setItems(items.filter((_, i) => i !== index));

  // 選擇材料下拉時：同步更新 materialName + 自動帶入 defaultPrice
  const handleMaterialSelect = (index: number, selectedName: string) => {
    const found = activeMaterials.find(m => m.name === selectedName);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      materialName: selectedName,
      unitPrice: found?.defaultPrice ?? newItems[index].unitPrice,
    };
    setItems(newItems);
  };

  const updateMaterial = (index: number, field: keyof EstimationItemSaveRequest, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addWorker = () => setWorkerItems([...workerItems, { workerId: workers?.[0]?.id || 0, days: 1, _key: Math.random().toString(36) }]);
  const removeWorker = (index: number) => setWorkerItems(workerItems.filter((_, i) => i !== index));
  const updateWorker = (index: number, field: keyof EstimationWorkerItemSaveRequest, value: number) => {
    const newItems = [...workerItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setWorkerItems(newItems);
  };

  const saveMutation = useMutation({
    mutationFn: () => saveEstimation(projectId, {
      profit: profit || 0,
      items: items.filter(i => i.materialName.trim() !== ''),
      workerItems: workerItems.filter(w => w.workerId > 0 && w.days > 0),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimation', projectId] });
      navigate('/projects');
    }
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">案件估價單</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {project?.caseCode} {project?.clientName ? `- ${project.clientName}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 hidden md:flex items-center gap-3">
            <Calculator size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-600">總金額:</span>
            <span className="text-lg font-bold text-slate-800">
              ${grandTotal.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="h-10 px-5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            儲存估價
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Materials Section */}
          <section className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                1. 材料項目
              </h2>
              <span className="text-sm font-medium text-slate-600">
                小計: ${materialsTotal.toLocaleString()}
              </span>
            </div>

            <div className="p-5">
              <div className="space-y-3">
                {/* Headers */}
                <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-slate-500 uppercase px-1">
                  <div className="col-span-12 md:col-span-5">材料名稱</div>
                  <div className="col-span-4 md:col-span-2">數量</div>
                  <div className="col-span-5 md:col-span-3">單價</div>
                  <div className="col-span-3 md:col-span-2 text-right">小計</div>
                </div>

                {items.map((item, index) => (
                  <div key={item._key} className="grid grid-cols-12 gap-3 items-center group relative">

                    {/* ✅ 材料名稱：改為下拉選單 */}
                    <div className="col-span-12 md:col-span-5">
                      <select
                        value={item.materialName}
                        onChange={(e) => handleMaterialSelect(index, e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none text-sm bg-white"
                      >
                        <option value="">請選擇材料</option>
                        {activeMaterials.map(m => (
                          <option key={m.id} value={m.name}>
                            {m.name}（{m.unit}）
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) => updateMaterial(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none text-sm"
                      />
                    </div>

                    {/* ✅ 單價：自動帶入但可手動修改 */}
                    <div className="col-span-5 md:col-span-3 relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice || ''}
                        onChange={(e) => updateMaterial(index, 'unitPrice', parseInt(e.target.value) || 0)}
                        className="w-full h-10 pl-7 pr-3 rounded-md border border-slate-300 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none text-sm"
                      />
                    </div>

                    <div className="col-span-3 md:col-span-2 text-right pr-8 lg:pr-10 font-medium text-slate-700">
                      ${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}
                    </div>
                    <button
                      onClick={() => removeMaterial(index)}
                      className="absolute right-0 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* ✅ 材料清單為空時提示 */}
              {activeMaterials.length === 0 && (
                <p className="mt-3 text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  目前系統中沒有任何材料，請先至「材料管理」新增。
                </p>
              )}

              <button
                onClick={addMaterial}
                className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors py-1.5 px-3 rounded-md hover:bg-indigo-50"
              >
                <Plus size={16} /> 新增材料
              </button>
            </div>
          </section>

          {/* Workers Section */}
          <section className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                2. 師傅工資
              </h2>
              <span className="text-sm font-medium text-slate-600">
                小計: ${laborTotal.toLocaleString()}
              </span>
            </div>

            <div className="p-5">
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-slate-500 uppercase px-1">
                  <div className="col-span-12 md:col-span-5">選擇師傅</div>
                  <div className="col-span-6 md:col-span-2">工時(天)</div>
                  <div className="col-span-6 md:col-span-3">預設日薪</div>
                  <div className="col-span-12 md:col-span-2 text-right">小計</div>
                </div>

                {workerItems.map((item, index) => {
                  const worker = workers?.find(w => w.id === item.workerId);
                  const subtotal = worker ? item.days * worker.dailyWage : 0;

                  return (
                    <div key={item._key} className="grid grid-cols-12 gap-3 items-center group relative">
                      <div className="col-span-12 md:col-span-5">
                        <select
                          value={item.workerId || ''}
                          onChange={(e) => updateWorker(index, 'workerId', Number(e.target.value))}
                          className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none text-sm bg-white"
                        >
                          <option value="" disabled>請選擇師傅</option>
                          {workers?.map(w => (
                            <option key={w.id} value={w.id}>{w.nickname}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0.1"
                          value={item.days || ''}
                          onChange={(e) => updateWorker(index, 'days', parseFloat(e.target.value) || 0)}
                          className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none text-sm"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3 text-sm text-slate-500 pt-2 md:pt-0">
                        {worker ? `$${worker.dailyWage.toLocaleString()}` : '—'}
                      </div>
                      <div className="col-span-12 md:col-span-2 text-right pr-8 lg:pr-10 font-medium text-slate-700 pt-1 md:pt-0">
                        ${subtotal.toLocaleString()}
                      </div>
                      <button
                        onClick={() => removeWorker(index)}
                        className="absolute right-0 md:top-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}

                {(!workers || workers.length === 0) && (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                    目前系統中沒有任何師傅名單，請先至「師傅管理」新增。
                  </p>
                )}
              </div>

              <button
                onClick={addWorker}
                disabled={!workers || workers.length === 0}
                className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors py-1.5 px-3 rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <Plus size={16} /> 加入師傅
              </button>
            </div>
          </section>

          {/* Profit & Summary Section */}
          <section className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-slate-800">3. 利潤與結算</h2>
            </div>
            <div className="p-5 flex flex-col md:flex-row gap-8 justify-between">

              <div className="flex-1 max-w-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">額外抓的利潤 (元)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={profit || ''}
                    onChange={(e) => setProfit(parseInt(e.target.value) || 0)}
                    className="w-full h-10 pl-7 pr-3 rounded-md border border-slate-300 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none"
                    placeholder="例如: 15000"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 flex-1 max-w-sm ml-auto">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">材料總計</span>
                    <span className="font-medium text-slate-700">${materialsTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">工資總計</span>
                    <span className="font-medium text-slate-700">${laborTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">利潤</span>
                    <span className="font-medium text-slate-700">${(profit || 0).toLocaleString()}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-300 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">總金額</span>
                    <span className="text-2xl font-bold text-[var(--color-accent)]">
                      ${grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Error Message */}
          {saveMutation.isError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
              儲存失敗: {saveMutation.error instanceof Error ? saveMutation.error.message : '未知錯誤'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}