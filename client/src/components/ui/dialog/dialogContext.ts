import { createContext, useContext } from 'react';

type DialogContextType = {
  openDialog: () => void;
  closeDialog: () => void;
  ref: React.RefObject<HTMLDialogElement>;
};
export const DialogContext = createContext<DialogContextType | undefined>(
  undefined,
);

export function useDialog() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('useDialog cant only be used inside a DialogProvider');
  }
  return context;
}
