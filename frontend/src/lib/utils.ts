import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 合併 Tailwind class 用的工具函式（shadcn/ui 慣例）
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
