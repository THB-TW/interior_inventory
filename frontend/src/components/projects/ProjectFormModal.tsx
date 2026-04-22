import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject, updateProject } from '@/services/projectService';
import type { Project } from '@/types/project';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import FormField from '@/components/common/FormField';

// ── Zod 驗證 Schema ────────────────────────────────────────────
const schema = z.object({
  clientName: z.string().min(1, '客戶姓名為必填'),
  clientPhone: z.string().optional(),
  city: z.string().min(1, '縣市為必填'),
  district: z.string().optional(),
  siteAddress: z.string().min(1, '詳細地址為必填'),
  salesUserId: z.number({ error: '負責業務 ID 為必填數字' }).min(1, '請輸入有效的業務 ID'),
  estimatedDays: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProjectFormModalProps {
  open: boolean;
  editTarget?: Project | null;  // 有值 = 編輯模式，null = 新增模式
  onClose: () => void;
}

const inputClass = (hasError?: boolean) =>
  cn(
    'h-9 w-full rounded-md border px-3 text-sm outline-none transition',
    'focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]',
    hasError ? 'border-red-400 bg-red-50' : 'border-[var(--color-border)] bg-white'
  );

// ── 主元件 ────────────────────────────────────────────────────
export default function ProjectFormModal({
  open,
  editTarget,
  onClose,
}: ProjectFormModalProps) {
  const isEdit = !!editTarget;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // 切換編輯 / 新增時 reset 表單資料
  useEffect(() => {
    if (editTarget) {
      reset({
        clientName: editTarget.clientName,
        clientPhone: editTarget.clientPhone ?? '',
        city: editTarget.city,
        district: editTarget.district ?? '',
        siteAddress: editTarget.addressLine,
        salesUserId: editTarget.salesUserId,
        estimatedDays: editTarget.estimatedDays ?? undefined,
      });
    } else {
      reset({ salesUserId: 1 });
    }
  }, [editTarget, reset]);

  // ── React Query Mutation ────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? updateProject(editTarget!.id, values)
        : createProject(values),
    onSuccess: () => {
      // 成功後讓 ['projects'] 相關的快取失效，自動重新 fetch 列表
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
  });

  if (!open) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal 本體 */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {isEdit ? '編輯案件' : '新增案件'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-[var(--color-text-muted)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 表單本體 */}
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="p-5 flex flex-col gap-3.5"
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField label="客戶姓名" required error={errors.clientName?.message}>
              <input {...register('clientName')} placeholder="王大明" className={inputClass(!!errors.clientName)} />
            </FormField>
            <FormField label="聯絡電話" error={errors.clientPhone?.message}>
              <input {...register('clientPhone')} placeholder="09xx-xxx-xxx" className={inputClass(!!errors.clientPhone)} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="縣市" required error={errors.city?.message}>
              <input {...register('city')} placeholder="台北市" className={inputClass(!!errors.city)} />
            </FormField>
            <FormField label="行政區" error={errors.district?.message}>
              <input {...register('district')} placeholder="信義區" className={inputClass(!!errors.district)} />
            </FormField>
          </div>

          <FormField label="詳細地址" required error={errors.siteAddress?.message}>
            <input {...register('siteAddress')} placeholder="信義路五段 7 號" className={inputClass(!!errors.siteAddress)} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="負責業務 ID" required error={errors.salesUserId?.message}>
              <input type="number" {...register('salesUserId', { valueAsNumber: true })} placeholder="1" className={inputClass(!!errors.salesUserId)} />
            </FormField>
            <FormField label="預計工期（天）" error={errors.estimatedDays?.message}>
              <input type="number" {...register('estimatedDays')} placeholder="30" className={inputClass(!!errors.estimatedDays)} />
            </FormField>
          </div>

          {/* 後端錯誤訊息 */}
          {mutation.isError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {mutation.error instanceof Error
                ? mutation.error.message
                : '操作失敗，請稍後再試'}
            </p>
          )}

          {/* Footer 按鈕 */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-9 px-5 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
            >
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? '儲存變更' : '建立案件'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
