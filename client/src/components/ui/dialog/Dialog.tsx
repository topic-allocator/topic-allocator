import { Cross1Icon } from '@radix-ui/react-icons';
import { ReactNode, useRef } from 'react';
import { DialogContext, useDialog } from './dialogContext';
import { twMerge } from 'tailwind-merge';
import ReactDOM from 'react-dom';

type ModalProps = {
  children: ReactNode;
  okAction?: () => void;
  header?: string;
} & JSX.IntrinsicElements['dialog'];

export default function Dialog({ children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  function handleClickOutside(e: MouseEvent) {
    if (e.target instanceof HTMLButtonElement) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const { left, right, top, bottom } = element.getBoundingClientRect();
    const isOutside = !(
      e.clientX > left &&
      e.clientX < right &&
      e.clientY > top &&
      e.clientY < bottom
    );

    if (isOutside) {
      ref.current?.close();
    }
  }

  function openDialog() {
    ref.current?.show();
    document.addEventListener('click', handleClickOutside);
  }

  function closeDialog() {
    ref.current?.close();
    document.removeEventListener('click', handleClickOutside);
  }

  return (
    <DialogContext.Provider
      value={{
        openDialog,
        closeDialog,
        ref,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

function Trigger({
  children,
  buttonIcon,
  buttonTitle,
  ...props
}: {
  children?: ReactNode;
  buttonIcon?: ReactNode;
  buttonTitle?: string;
} & JSX.IntrinsicElements['button']) {
  const { openDialog: openModal } = useDialog();

  return (
    children ?? (
      <button
        {...props}
        className={twMerge(
          'flex items-center rounded-full bg-emerald-400  hover:bg-emerald-500',
          props.className,
        )}
        onClick={openModal}
      >
        {buttonIcon}
        {buttonTitle && <span className="px-3 py-1">{buttonTitle}</span>}
      </button>
    )
  );
}

function Body({ children, ...props }: { children: ReactNode } & JSX.IntrinsicElements['dialog']) {
  const { closeDialog: closeModal, ref } = useDialog();

  return ReactDOM.createPortal(
    <>
      <dialog ref={ref} {...props} onClose={closeModal}>
        {children}
      </dialog>
    </>,
    document.body,
  );
}

function Header({ children, headerTitle }: { children?: ReactNode; headerTitle?: string }) {
  const { closeDialog: closeModal } = useDialog();

  return (
    children ?? (
      <header className="flex h-12 items-center justify-between border-b">
        <h3 className="px-3 text-xl">{headerTitle}</h3>

        <Cross1Icon
          role="button"
          className="m-3 cursor-pointer rounded-full p-2 hover:bg-gray-300"
          width={30}
          height={30}
          onClick={closeModal}
        />
      </header>
    )
  );
}

function Footer({ children }: { children?: ReactNode }) {
  return (
    children ?? (
      <footer className="flex justify-end gap-3 border-t px-2">
        <button className="my-1 rounded-md bg-gray-300 px-3 py-1 transition hover:bg-gray-400">
          Cancel
        </button>

        <button
          type="submit"
          className="my-1 rounded-md bg-emerald-400 px-3 py-1 transition hover:bg-emerald-500"
        >
          Create
        </button>
      </footer>
    )
  );
}

Dialog.Trigger = Trigger;
Dialog.Body = Body;
Dialog.Header = Header;
Dialog.Footer = Footer;
