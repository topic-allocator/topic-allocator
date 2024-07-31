import LabelProvider from '@/contexts/labels/label-provider';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import SessionProvider from '@/contexts/session/session-provider';
import ToastProvider from '@/contexts/toast/toast-provider';
import { useCloseDetailsOnClickOutside } from './utils';
import TrpcProvider from './contexts/trpc-provider';

export default function App() {
  useCloseDetailsOnClickOutside();

  return (
    <LabelProvider>
      <ToastProvider>
        <TrpcProvider>
          <SessionProvider>
            <RouterProvider router={router} />
          </SessionProvider>
        </TrpcProvider>
      </ToastProvider>
    </LabelProvider>
  );
}
