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
import Button from '@/components/ui/button';
import { useLabels } from '../labels/label-context';

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
  const { labels } = useLabels();

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
        <ul className="toast pointer-events-auto items-end font-semibold">
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
                    className={cn(`toast-slide-in alert gap-2 p-3`, {
                      'alert-success': toast.type === 'success',
                      'alert-error': toast.type === 'error',
                      'alert-warning': toast.type === 'warning',
                      'alert-info': toast.type === 'info',
                    })}
                    data-toast-id={toast.id}
                  >
                    {typeIconMap[toast.type]}

                    {toast.message}

                    {toast.type !== 'success' && (
                      <Button
                        className={cn('btn btn-square btn-outline', {
                          'btn-error': toast.type === 'error',
                          'btn-warning': toast.type === 'warning',
                          'btn-info': toast.type === 'info',
                        })}
                        style={{ borderColor: 'black' }}
                        onClick={() => deleteToast(toast)}
                        icon={
                          <Cross1Icon
                            className="text-black"
                            width={20}
                            height={20}
                          />
                        }
                      />
                    )}
                  </li>
                );
              }
            })}

          {toasts.length > LIMIT && (
            <li className="relative flex items-center gap-1 rounded-md px-3 py-1">
              <Button
                label={labels.CLEAR_ALL}
                className="btn-outline"
                onClick={deleteAllToasts}
              />
              <ListBulletIcon width={25} height={25} />
              {toasts.length - LIMIT} {labels.MORE.toLowerCase()}...
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
  success: <CheckCircledIcon width={25} height={25} />,
  info: <InfoCircledIcon width={25} height={25} />,
  warning: <ExclamationTriangleIcon width={25} height={25} />,
  error: <ExclamationTriangleIcon width={25} height={25} />,
};

const typeDefaultDurationMap = {
  success: 2000,
  info: 5000,
  warning: 5000,
  error: 7000,
};
