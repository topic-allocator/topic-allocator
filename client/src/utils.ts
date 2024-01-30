import { clsx, type ClassValue } from 'clsx';
import { useEffect } from 'react';
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

export function useCloseDetailsOnClickOutside() {
  useEffect(() => {
    function closeDetails(e: MouseEvent) {
      if (!e.target) {
        return;
      }

      const details = [...document.querySelectorAll('details')];

      details
        .filter((d) => !d.contains(e.target as Node))
        .forEach((d) => d.removeAttribute('open'));
    }
    document.addEventListener('click', closeDetails);

    return () => {
      document.removeEventListener('click', closeDetails);
    };
  }, []);
}
