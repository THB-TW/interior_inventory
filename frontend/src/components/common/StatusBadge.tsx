import {
  ProjectStatus,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from '@/types/project';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ProjectStatus;
}

/**
 * 案件狀態徽章元件
 * 根據狀態自動套用對應的顏色樣式
 */
export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        PROJECT_STATUS_COLORS[status]
      )}
    >
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}
