import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 智能合并 Tailwind 类名，解决样式冲突与权重覆盖问题
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}