import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;   // 0-indexed（對應後端）
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * 分頁導覽元件
 * 注意：後端的 page 是 0-indexed，顯示時 +1 轉換成使用者習慣的 1-indexed
 */
export default function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  // 產生要顯示的頁碼列表（最多顯示 5 個）
  const pages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (currentPage > 2) pages.push('...');
    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages - 2, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 3) pages.push('...');
    pages.push(totalPages - 1);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
      {/* 顯示筆數資訊 */}
      <p className="text-xs text-[var(--color-text-muted)]">
        共 {totalElements} 筆，顯示第 {startItem}–{endItem} 筆
      </p>

      {/* 頁碼按鈕群 */}
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-[var(--color-text-muted)] text-sm">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                'w-7 h-7 rounded text-xs transition-colors',
                page === currentPage
                  ? 'bg-[var(--color-accent)] text-white font-medium'
                  : 'hover:bg-gray-100 text-[var(--color-text-secondary)]'
              )}
            >
              {(page as number) + 1}
            </button>
          )
        )}

        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
