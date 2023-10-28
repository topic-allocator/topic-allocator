import { Cross1Icon } from '@radix-ui/react-icons';
import { ReactNode, useRef } from 'react';
import { DialogContext, useDialog } from './dialogContext';
import { cn } from '../../../utils';

type ModalProps = {
  children: ReactNode;
  header?: string;
} & JSX.IntrinsicElements['dialog'];

export default function Dialog({ children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  function handleClickOutside(e: MouseEvent) {
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
      closeDialog();
    }
  }

  function openDialog() {
    ref.current?.showModal();

    document.removeEventListener('click', handleClickOutside);
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    });
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
  const { closeDialog, ref } = useDialog();

  return (
    <>
      <dialog
        ref={ref}
        className={cn('max-w-[min(90vw,56rem)]', className)}
        {...props}
        onClose={closeDialog}
      >
        {children}
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

  return (
    children ?? (
      <footer className="flex justify-end gap-3 border-t">
        <button
          className="my-1 rounded-md bg-gray-300 px-3 py-1 transition hover:bg-gray-400"
          onClick={closeDialog}
        >
          {closeButtonText ?? 'Cancel'}
        </button>

        {okButton && okButton}

        {okAction && (
          <button
            className="my-1 rounded-md bg-emerald-400 px-3 py-1 transition hover:bg-emerald-500"
            onClick={okAction}
          >
            {confirmButtonText ?? 'Ok'}
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
