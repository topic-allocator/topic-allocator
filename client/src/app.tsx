import LabelProvider from '@/contexts/labels/label-provider';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import SessionProvider from '@/contexts/session/session-provider';
import QueryProvider from '@/contexts/query-provider';
import ToastProvider from '@/contexts/toast/toast-provider';

export default function App() {
  return (
    <LabelProvider>
      <ToastProvider>
        <QueryProvider>
          <SessionProvider>
            <RouterProvider router={router} />
          </SessionProvider>
        </QueryProvider>
      </ToastProvider>
    </LabelProvider>
  );
}
