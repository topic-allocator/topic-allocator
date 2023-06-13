import LabelProvider from './contexts/labels/LabelProvider';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import SessionProvider from './contexts/session/SessionProvider';
import QueryProvider from './contexts/QueryProvider';
import ToastProvider from './contexts/toast/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      <QueryProvider>
        <SessionProvider>
          <LabelProvider>
            <RouterProvider router={router} />
          </LabelProvider>
        </SessionProvider>
      </QueryProvider>
    </ToastProvider>
  );
}
