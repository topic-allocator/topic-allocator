import { createContext, useContext } from 'react';

type ModalContextType = {
  openModal: () => void;
  closeModal: () => void;
  ref: React.RefObject<HTMLDialogElement>;
};
export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModalContext() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModalContext cant only be used inside a Modal');
  }
  return context;
}
