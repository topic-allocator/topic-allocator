import { cn } from '@/utils';
import { forwardRef } from 'react';
import Spinner from './spinner';

type ButtonProps = {
  label?: string | React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
} & JSX.IntrinsicElements['button'];

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { label, icon, isLoading, children, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn('btn btn-sm', className, {
        'btn-disabled': isLoading,
      })}
      {...props}
    >
      <div className="join pointer-events-none items-center gap-1">
        {label}
        {children}
        {isLoading ? (
          <Spinner width={20} height={20} />
        ) : (
          <>{icon && <span className="pointer-events-none">{icon}</span>}</>
        )}
      </div>
    </button>
  );
});

export default Button;
