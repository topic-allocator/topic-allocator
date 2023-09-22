import { createContext, useContext } from 'react';
import { labels } from '../../labels';

export type Toast = {
  message: keyof typeof labels;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
};
type ToastContextType = {
  pushToast: (toast: Toast) => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined,
);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
