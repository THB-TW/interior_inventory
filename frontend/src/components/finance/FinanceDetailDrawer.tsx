import { useState } from 'react';
import type { ProjectProfitDTO } from '@/types/finance';
import { financeService } from '@/services/financeService';

interface Props {
    data: ProjectProfitDTO;
    onClose: () => void;
    onUpdated: (updated: ProjectProfitDTO) => void;
}

function fmt(n: number | null) {
    if (n == null) return '—';
    return `$${n.toLocaleString('zh-TW')}`;
}

export default function FinanceDetailDrawer({ data, onClose, onUpdated }: Props) {
    const [contractAmount, setContractAmount] = useState(data.contractAmount?.toString() ?? '');
    const [receivedAmount, setReceivedAmount] = useState(data.receivedAmount?.toString() ?? '');
    const [paymentStatus, setPaymentStatus] = useState(data.paymentStatus ?? 'PENDING');
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        try {
            await financeService.updateContractInfo(data.projectId, {
                contractAmount: Number(contractAmount),
                receivedAmount: Number(receivedAmount),
                paymentStatus,
            });
            const updated = await financeService.getProjectProfit(data.projectId);
            onUpdated(updated);
            onClose();
        } finally {
            setSaving(false);
        }
    }

    const rows = [
        { label: '材料成本', value: fmt(data.materialCost), color: 'text-orange-600' },
        { label: '師傅工資', value: fmt(data.workerCost), color: 'text-blue-600' },
        { label: '車馬費', value: fmt(data.travelCost), color: 'text-blue-400' },
        { label: '工程利潤', value: fmt(data.profit), color: data.profit >= 0 ? 'text-green-600' : 'text-red-500' },
    ];

    return (
        <div className="fixed inset-0 z-40 flex justify-end">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <aside className="relative z-50 w-full max-w-md bg-white h-full shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <p className="text-xs text-gray-400 font-mono">{data.projectCode}</p>
                        <h2 className="text-base font-semibold text-gray-800">{data.clientName}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                </div>

                {/* 成本明細 */}
                <div className="px-6 py-4 space-y-2 border-b">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">成本明細</p>
                    {rows.map(r => (
                        <div key={r.label} className="flex justify-between text-sm">
                            <span className="text-gray-500">{r.label}</span>
                            <span className={`font-medium ${r.color}`}>{r.value}</span>
                        </div>
                    ))}
                    {data.profitRate != null && (
                        <div className="flex justify-between text-sm pt-1 border-t mt-2">
                            <span className="text-gray-500">利潤率</span>
                            <span className="font-semibold">{data.profitRate.toFixed(1)}%</span>
                        </div>
                    )}
                </div>

                {/* 收款設定 */}
                <div className="px-6 py-4 space-y-4 flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">收款設定</p>

                    <label className="block space-y-1">
                        <span className="text-sm text-gray-600">合約金額</span>
                        <input
                            type="number"
                            value={contractAmount}
                            onChange={e => setContractAmount(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="0"
                        />
                    </label>

                    <label className="block space-y-1">
                        <span className="text-sm text-gray-600">已收款金額</span>
                        <input
                            type="number"
                            value={receivedAmount}
                            onChange={e => setReceivedAmount(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="0"
                        />
                    </label>

                    <label className="block space-y-1">
                        <span className="text-sm text-gray-600">收款狀態</span>
                        <select
                            value={paymentStatus}
                            onChange={e => setPaymentStatus(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        >
                            <option value="PENDING">未收款</option>
                            <option value="PARTIAL">部分收款</option>
                            <option value="COMPLETED">已收款</option>
                        </select>
                    </label>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
                    >
                        {saving ? '儲存中...' : '儲存'}
                    </button>
                </div>
            </aside>
        </div>
    );
}