import { forwardRef } from 'react';
import { cn } from '@/utils';

const Input = forwardRef<HTMLInputElement, JSX.IntrinsicElements['input']>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn('rounded-md border px-3 py-1', className)}
        {...props}
      />
    );
  },
);

export default Input;
