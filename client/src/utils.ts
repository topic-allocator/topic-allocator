import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    return Promise.reject(res);
  }

  return res.json();
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleString('hu', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
