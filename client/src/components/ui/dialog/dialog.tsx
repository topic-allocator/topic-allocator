import { Cross1Icon } from '@radix-ui/react-icons';
import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  DialogContext,
  useDialog,
} from '@/components/ui/dialog/dialog-context';
import { cn } from '@/utils';
import { useLabels } from '@/contexts/labels/label-context';
import Button, { ButtonProps } from '../button';

type ModalProps = {
  children: ReactNode;
  clickOutsideToClose?: boolean;
} & JSX.IntrinsicElements['dialog'];

export default function Dialog({
  children,
  clickOutsideToClose = true,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

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
  label,
  ...props
}: {
  children?: ReactNode;
} & Omit<ButtonProps, 'ref'>) {
  const { openDialog } = useDialog();

  return (
    children ?? (
      <Button
        label={label}
        title={typeof label === 'string' ? label : undefined}
        onClick={openDialog}
        {...props}
      />
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
        className={cn(
          'max-w-[min(90vw,56rem)] animate-pop-in rounded-md bg-base-300 px-3 py-0 text-base-content shadow-2xl',
          className,
        )}
        onClose={closeDialog}
        {...props}
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
  const { closeDialog } = useDialog();

  return (
    children ?? (
      <header className="flex h-fit min-h-[3rem] items-center justify-between gap-3 border-b border-neutral-500/50 py-1">
        <h3 className="text-2xl">{headerTitle}</h3>

        <Button
          className="btn-circle btn-neutral size-10 p-1"
          icon={<Cross1Icon width={25} height={25} />}
          onClick={closeDialog}
        />
      </header>
    )
  );
}

type FooterProps = {
  closeButtonLabel?: string;
  children?: ReactNode;
} & (
  | {
      okAction?: () => void;
      confirmButtonLabel?: string;
      okButton?: never;
    }
  | {
      okButton: ReactNode;
      okAction?: undefined;
      confirmButtonLabel?: undefined;
    }
) &
  JSX.IntrinsicElements['footer'];

function Footer({
  okAction,
  confirmButtonLabel,
  okButton,
  closeButtonLabel,
  className,
  children,
}: FooterProps) {
  const { closeDialog } = useDialog();
  const { labels } = useLabels();

  return (
    children ?? (
      <footer
        className={cn(
          'flex items-center justify-end gap-3 border-t border-neutral-500/50 py-1',
          className,
        )}
      >
        <Button
          className="btn-neutral"
          label={closeButtonLabel ?? labels.CANCEL}
          onClick={closeDialog}
        />

        {okButton && okButton}

        {okAction && (
          <Button
            label={confirmButtonLabel ?? labels.CONFIRM}
            className="btn-success"
            onClick={okAction}
          />
        )}
      </footer>
    )
  );
}

Dialog.Trigger = Trigger;
Dialog.Body = Body;
Dialog.Header = Header;
Dialog.Footer = Footer;
