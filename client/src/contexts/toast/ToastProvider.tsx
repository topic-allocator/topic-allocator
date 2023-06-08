import ReactDOM from 'react-dom';
import { Toast, ToastContext } from './toastContext';
import { useState } from 'react';
import { cn } from '../../utils';
import { Cross1Icon, ListBulletIcon } from '@radix-ui/react-icons';
import { v4 as uuid } from 'uuid';

const limit = 5;

type ManagedToast = Toast & {
  id: string;
  timeout?: NodeJS.Timeout;
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ManagedToast[]>([]);

  function pushToast(toast: Toast) {
    setToasts((prev) => [
      ...prev,
      {
        ...toast,
        id: uuid(),
        duration: toast.duration ?? 7000,
      },
    ]);
  }

  function deleteAllToasts() {
    toasts.forEach((toast) => {
      deleteToast(toast);
    });
  }

  function deleteToast(toast: ManagedToast) {
    const toastHtmlElement = document.querySelector(`[data-toast-id="${toast.id}"]`);
    if (toastHtmlElement) {
      toastHtmlElement.classList.add('toast-slide-out');
    }

    clearTimeout(toast.timeout);
    setTimeout(
      () => setToasts((prev) => prev.filter((toastInList) => toast.id !== toastInList.id)),
      450,
    );
  }

  return (
    <ToastContext.Provider
      value={{
        pushToast,
      }}
    >
      {ReactDOM.createPortal(
        <ul className="pointer-events-auto fixed bottom-0 right-0 z-50 flex w-fit flex-col items-end gap-1 pb-3 pr-3 font-semibold">
          {toasts.reverse().map((toast, index) => {
            if (index < limit) {
              if (!toast.timeout && toast.duration !== 0) {
                toast.timeout = setTimeout(() => deleteToast(toast), toast.duration);
              }

              return (
                <li
                  key={toast.id}
                  className={cn(
                    'toast-slide-in relative flex w-full items-center justify-between gap-3 rounded-md border px-3 py-1 md:w-min md:min-w-[300px]',
                    {
                      'border-emerald-500 bg-emerald-300': toast.type === 'success',
                      'border-red-500 bg-red-300': toast.type === 'error',
                      'border-yellow-600 bg-yellow-300': toast.type === 'warning',
                      'border-sky-500 bg-sky-200': toast.type === 'info',
                    },
                  )}
                  data-toast-id={toast.id}
                >
                  <span>{toast.message}</span>

                  <button
                    className={cn(' cursor-pointer rounded-full p-2', {
                      'hover:bg-gray-200': toast.type === 'success',
                      'hover:bg-red-200': toast.type === 'error',
                      'hover:bg-yellow-200': toast.type === 'warning',
                      'hover:bg-blue-200': toast.type === 'info',
                    })}
                    onClick={() => deleteToast(toast)}
                  >
                    <Cross1Icon className="pointer-events-none" width={20} height={20} />
                  </button>
                </li>
              );
            }
          })}

          {toasts.length > limit && (
            <li className="relative flex  items-center gap-1 rounded-md px-3 py-1">
              <button
                className="mr-2 rounded-md bg-gray-300 px-2 py-1 transition hover:bg-gray-400"
                onClick={deleteAllToasts}
              >
                Clear all
              </button>
              <ListBulletIcon width={25} height={25} /> {toasts.length - limit} more...
            </li>
          )}
        </ul>,
        document.body,
      )}

      {children}
    </ToastContext.Provider>
  );
}
