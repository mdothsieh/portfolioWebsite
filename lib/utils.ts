// Shared cn() helper: merges clsx conditional classes through tailwind-merge so
// later Tailwind utilities override earlier conflicting ones. Used across components.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
