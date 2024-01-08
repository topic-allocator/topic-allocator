import { Cross1Icon } from '@radix-ui/react-icons';
import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  DialogContext,
  useDialog,
} from '@/components/ui/dialog/dialog-context';
import { cn } from '@/utils';
import { useLabels } from '@/contexts/labels/label-context';

type ModalProps = {
  children: ReactNode;
  initiallyOpen?: boolean;
  clickOutsideToClose?: boolean;
} & JSX.IntrinsicElements['dialog'];

export default function Dialog({
  children,
  initiallyOpen = false,
  clickOutsideToClose = true,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  function openDialog() {
    setIsOpen(true);
  }

  function closeDialog() {
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!clickOutsideToClose) {
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
        e.stopImmediatePropagation();
        closeDialog();
      }
    }

    if (isOpen) {
      ref.current?.showModal();

      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      });
    } else {
      ref.current?.close();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, clickOutsideToClose]);

  return (
    <DialogContext.Provider
      value={{
        openDialog,
        closeDialog,
        ref,
        isOpen,
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
  className,
  ...props
}: {
  children?: ReactNode;
  buttonIcon?: ReactNode;
  buttonTitle?: string | ReactNode;
} & JSX.IntrinsicElements['button']) {
  const { openDialog } = useDialog();

  return (
    children ?? (
      <button
        {...props}
        className={cn(
          'flex items-center justify-center rounded-full bg-emerald-400 transition hover:bg-emerald-500',
          className,
        )}
        onClick={openDialog}
      >
        {buttonIcon}
        {typeof buttonTitle === 'string' ? (
          <span className="pointer-events-none px-3 py-1">{buttonTitle}</span>
        ) : (
          buttonTitle
        )}
      </button>
    )
  );
}

function Body({
  children,
  className,
  ...props
}: { children: ReactNode } & JSX.IntrinsicElements['dialog']) {
  const { closeDialog, ref, isOpen } = useDialog();

  return (
    <>
      <dialog
        ref={ref}
        className={cn('max-w-[min(90vw,56rem)]', className)}
        {...props}
        onClose={closeDialog}
      >
        {isOpen && children}
      </dialog>
    </>
  );
}

function Header({
  children,
  headerTitle,
}: {
  children?: ReactNode;
  headerTitle?: string;
}) {
  const { closeDialog: closeModal } = useDialog();

  return (
    children ?? (
      <header className="flex h-fit min-h-[3rem] items-center justify-between gap-3 border-b py-1">
        <h3 className="text-xl">{headerTitle}</h3>

        <Cross1Icon
          role="button"
          className="cursor-pointer rounded-full p-2 hover:bg-gray-300"
          width={35}
          height={35}
          onClick={closeModal}
        />
      </header>
    )
  );
}

type FooterProps = {
  closeButtonText?: string;
  children?: ReactNode;
} & (
  | {
      okAction?: () => void;
      confirmButtonText?: string;
      okButton?: never;
    }
  | {
      okButton: ReactNode;
      okAction?: undefined;
      confirmButtonText?: undefined;
    }
);

function Footer({
  okAction,
  confirmButtonText,
  okButton,
  closeButtonText,
  children,
}: FooterProps) {
  const { closeDialog } = useDialog();
  const { labels } = useLabels();

  return (
    children ?? (
      <footer className="flex justify-end gap-3 border-t">
        <button
          className="my-1 rounded-md bg-gray-300 px-3 py-1 transition hover:bg-gray-400"
          onClick={closeDialog}
        >
          {closeButtonText ?? labels.CANCEL}
        </button>

        {okButton && okButton}

        {okAction && (
          <button
            className="my-1 rounded-md bg-emerald-400 px-3 py-1 transition hover:bg-emerald-500"
            onClick={okAction}
          >
            {confirmButtonText ?? labels.CONFIRM}
          </button>
        )}
      </footer>
    )
  );
}

Dialog.Trigger = Trigger;
Dialog.Body = Body;
Dialog.Header = Header;
Dialog.Footer = Footer;
