import ReactDOM from 'react-dom';
import { Toast, ToastContext } from '@/contexts/toast/toast-context';
import { useCallback, useState } from 'react';
import { cn } from '@/utils';
import {
  CheckCircledIcon,
  Cross1Icon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  ListBulletIcon,
} from '@radix-ui/react-icons';
import { v4 as uuid } from 'uuid';

const LIMIT = 5;

type ManagedToast = Toast & {
  id: string;
  createdAt: number;
  timeout?: NodeJS.Timeout;
};

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ManagedToast[]>([]);

  const pushToast = useCallback((toast: Toast) => {
    setToasts((prev) => [
      ...prev,
      {
        ...toast,
        id: uuid(),
        duration: toast.duration ?? typeDefaultDurationMap[toast.type],
        createdAt: Date.now(),
      },
    ]);
  }, []);

  function deleteAllToasts() {
    toasts.forEach((toast) => {
      deleteToast(toast);
    });
  }

  function deleteToast(toast: ManagedToast) {
    clearTimeout(toast.timeout);

    const toastHtmlElement = document.querySelector(
      `[data-toast-id="${toast.id}"]`,
    );
    if (toastHtmlElement) {
      toastHtmlElement.animate(
        [
          {},
          {
            transform: 'translateX(100%)',
          },
        ],
        {
          duration: 500,
          fill: 'forwards',
        },
      ).onfinish = () =>
        setToasts((prev) =>
          prev.filter((toastInList) => toast.id !== toastInList.id),
        );
    } else {
      // never should happen, but just in case
      setToasts((prev) =>
        prev.filter((toastInList) => toast.id !== toastInList.id),
      );
    }
  }

  return (
    <ToastContext.Provider
      value={{
        pushToast,
      }}
    >
      {ReactDOM.createPortal(
        <ul className="pointer-events-auto fixed bottom-0 right-0 z-50 flex w-fit flex-col items-end gap-1 pb-3 pr-3 font-semibold">
          {toasts
            .sort((a, b) => a.createdAt - b.createdAt)
            .map((toast, index) => {
              if (index < LIMIT) {
                if (!toast.timeout && toast.duration !== 0) {
                  toast.timeout = setTimeout(
                    () => deleteToast(toast),
                    toast.duration,
                  );
                }

                return (
                  <li
                    key={toast.id}
                    className={cn(
                      `toast-slide-in relative flex w-full items-center justify-between
                      gap-3 rounded-md border border-opacity-50 bg-opacity-75 px-3
                      py-1 shadow-md backdrop-blur md:w-min md:min-w-[300px]`,
                      {
                        'border-emerald-300 bg-emerald-200':
                          toast.type === 'success',
                        'border-red-300 bg-red-200': toast.type === 'error',
                        'border-yellow-500 bg-yellow-200':
                          toast.type === 'warning',
                        'border-sky-500 bg-sky-200': toast.type === 'info',
                      },
                    )}
                    data-toast-id={toast.id}
                  >
                    {typeIconMap[toast.type]}

                    <span>{toast.message}</span>

                    <button
                      className={cn(' cursor-pointer rounded-full p-2', {
                        'hover:bg-emerald-300': toast.type === 'success',
                        'hover:bg-red-300': toast.type === 'error',
                        'hover:bg-yellow-200': toast.type === 'warning',
                        'hover:bg-blue-200': toast.type === 'info',
                      })}
                      onClick={() => deleteToast(toast)}
                    >
                      <Cross1Icon
                        className="pointer-events-none"
                        width={20}
                        height={20}
                      />
                    </button>
                  </li>
                );
              }
            })}

          {toasts.length > LIMIT && (
            <li className="relative flex  items-center gap-1 rounded-md px-3 py-1">
              <button
                className="mr-2 rounded-md bg-gray-300 px-2 py-1 transition hover:bg-gray-400"
                onClick={deleteAllToasts}
              >
                Clear all
              </button>
              <ListBulletIcon width={25} height={25} /> {toasts.length - LIMIT}{' '}
              more...
            </li>
          )}
        </ul>,
        document.body,
      )}

      {children}
    </ToastContext.Provider>
  );
}

const typeIconMap = {
  success: <CheckCircledIcon width={20} height={20} />,
  info: <InfoCircledIcon width={20} height={20} />,
  warning: <ExclamationTriangleIcon width={20} height={20} />,
  error: <ExclamationTriangleIcon width={20} height={20} />,
};

const typeDefaultDurationMap = {
  success: 2000,
  info: 5000,
  warning: 5000,
  error: 7000,
};
