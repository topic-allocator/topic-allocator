import { cn } from '@/utils';
import { forwardRef } from 'react';
import Spinner from './spinner';

export type ButtonProps = {
  label?: string | React.ReactNode;
  icon?: React.ReactNode;
  isPending?: boolean;
} & JSX.IntrinsicElements['button'];

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { label, icon, isPending, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'btn btn-sm flex-nowrap',
        {
          'btn-disabled': isPending,
        },
        className,
      )}
      {...props}
    >
      {label}
      {isPending ? <Spinner width={20} height={20} /> : icon}
    </button>
  );
});

export default Button;
