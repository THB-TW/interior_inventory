// frontend/src/components/quote/EstimationImportDrawer.tsx

import { useState } from 'react';
import { X, Lightbulb, PackagePlus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMaterials } from '@/services/materialService';
import { getEstimation, saveEstimation } from '@/services/estimationService';
import { createProjectMaterial, type QuoteMaterialPayload } from '@/services/quoteService';
import type { QuoteProjectUsage } from '@/types/quote';

interface EstimationImportDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    project: QuoteProjectUsage;
}

export default function EstimationImportDrawer({
    isOpen,
    onClose,
    project,
}: EstimationImportDrawerProps) {
    const queryClient = useQueryClient();
    const [selections, setSelections] = useState<boolean[]>([]);
    const [isDone, setIsDone] = useState(false);

    const { data: materials = [] } = useQuery({
        queryKey: ['materials'],
        queryFn: getMaterials,
        enabled: isOpen,
    });

    const { data: estimation, isLoading: isEstimationLoading } = useQuery({
        queryKey: ['estimation', project.projectId],
        queryFn: () => getEstimation(project.projectId),
        enabled: isOpen,
    });

    const estimationItems = estimation?.items ?? [];

    const rows = estimationItems.map((item) => {
        const matched = materials.find(
            (m) => m.name.trim().toLowerCase() === item.materialName.trim().toLowerCase()
        );
        return { item, matchedMaterialId: matched?.id ?? null };
    });

    const effectiveSelections: boolean[] =
        selections.length === rows.length
            ? selections
            : rows.map((r) => r.matchedMaterialId !== null);

    const toggleSelect = (index: number) => {
        const next = [...effectiveSelections];
        next[index] = !next[index];
        setSelections(next);
    };

    const handleClose = () => {
        setSelections([]);
        setIsDone(false);
        onClose();
    };

    const importMutation = useMutation({
        mutationFn: async () => {
            // Step 1: 匯入選取的 items 至用料表
            const toImport = rows.filter(
                (row, i) => effectiveSelections[i] && row.matchedMaterialId !== null
            );
            for (const row of toImport) {
                const payload: QuoteMaterialPayload = {
                    materialId: row.matchedMaterialId!,
                    materialType: 'PURCHASE',
                    quantity: row.item.quantity,
                    unitPrice: row.item.unitPrice,
                };
                await createProjectMaterial(project.projectId, payload);
            }

            // Step 2: 把已匯入的 items 從 estimation 中移除
            // 已匯入的 materialName set
            const importedNames = new Set(toImport.map((r) => r.item.materialName));

            // 保留未被匯入的 items
            const remainingItems = estimationItems
                .filter((item) => !importedNames.has(item.materialName))
                .map((item) => ({
                    materialName: item.materialName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                }));

            // 保留 workerItems、profit、laborCost 不動
            await saveEstimation(project.projectId, {
                items: remainingItems,
                workerItems: (estimation?.workerItems ?? []).map((w) => ({
                    workerId: w.workerId,
                    days: w.days,
                })),
                profit: estimation?.profit ?? 0,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['case-material-lines', project.projectId] });
            queryClient.invalidateQueries({ queryKey: ['quote-overview'] });
            queryClient.invalidateQueries({ queryKey: ['estimation', project.projectId] });
            setIsDone(true);
        },
    });

    if (!isOpen) return null;

    const matchedCount = rows.filter(
        (r, i) => effectiveSelections[i] && r.matchedMaterialId !== null
    ).length;
    const unmatchedCount = rows.filter((r) => r.matchedMaterialId === null).length;

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={handleClose} />

            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-amber-50">
                    <div className="flex items-center gap-2 text-amber-700">
                        <Lightbulb size={24} className="fill-amber-400" />
                        <h2 className="text-lg font-bold">估價材料匯入</h2>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {isEstimationLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                            <Loader2 size={28} className="animate-spin text-amber-500" />
                            <p className="text-sm">讀取估價資料中...</p>
                        </div>
                    ) : estimationItems.length === 0 ? (
                        <div className="text-center text-slate-500 mt-10">
                            <Lightbulb size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="font-medium">此案件尚無估價材料</p>
                            <p className="text-sm mt-1">請先至案件頁面填寫估價單。</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                系統從估價單偵測到{' '}
                                <span className="font-semibold text-amber-700">{estimationItems.length}</span>{' '}
                                筆材料。匯入後將從估價單中移除該筆項目。
                            </p>

                            <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2">
                                <span className="font-mono font-medium text-slate-700">{project.projectCode}</span>
                                {' '}｜ {project.clientName}
                            </div>

                            {unmatchedCount > 0 && (
                                <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                    <span>
                                        有 <strong>{unmatchedCount}</strong> 筆名稱在材料庫找不到對應，無法匯入。
                                        請先至「材料管理」新增後再試。
                                    </span>
                                </div>
                            )}

                            {rows.map((row, index) => {
                                const selected = effectiveSelections[index];
                                const matched = row.matchedMaterialId !== null;

                                return (
                                    <div
                                        key={index}
                                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 left-0 w-1 h-full ${matched ? 'bg-amber-400' : 'bg-slate-300'}`} />

                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selected && matched}
                                                    onChange={() => matched && toggleSelect(index)}
                                                    disabled={!matched}
                                                    className="w-4 h-4 accent-amber-500 cursor-pointer disabled:cursor-not-allowed"
                                                />
                                                <h3 className="font-bold text-slate-800">{row.item.materialName}</h3>
                                            </div>
                                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${matched ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-500'}`}>
                                                {matched ? `x ${row.item.quantity}` : '未比對'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mt-3 text-sm pl-6">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <span className="text-slate-400 text-xs">單價</span>
                                                <span className="font-medium text-[var(--color-primary)]">
                                                    ${row.item.unitPrice.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="text-slate-400 text-xs">小計</span>
                                                <span>${(row.item.quantity * row.item.unitPrice).toLocaleString()}</span>
                                            </div>
                                            {matched && (
                                                <div className="text-slate-400 text-xs">
                                                    匯入後將從估價單移除此項目
                                                </div>
                                            )}
                                        </div>

                                        {!matched && (
                                            <div className="mt-3 pl-6 text-xs text-slate-400">
                                                請先至材料管理新增「{row.item.materialName}」
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {estimationItems.length > 0 && !isEstimationLoading && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-white">
                        {isDone ? (
                            <div className="flex items-center gap-2 justify-center text-green-700 font-medium text-sm py-2">
                                <CheckCircle2 size={18} />
                                匯入完成！已新增 {matchedCount} 筆至用料表，並從估價單移除。
                            </div>
                        ) : (
                            <button
                                onClick={() => importMutation.mutate()}
                                disabled={importMutation.isPending || matchedCount === 0}
                                className="mt-4 w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium rounded-lg text-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {importMutation.isPending ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        處理中...
                                    </>
                                ) : (
                                    <>
                                        <PackagePlus size={16} />
                                        確認匯入 {matchedCount} 筆，並從估價單移除
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}