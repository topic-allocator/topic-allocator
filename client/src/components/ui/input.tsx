import { forwardRef } from 'react';
import { cn } from '@/utils';

const Input = forwardRef<HTMLInputElement, JSX.IntrinsicElements['input']>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn('input input-bordered input-sm w-[13rem]', className)}
        {...props}
      />
    );
  },
);

export default Input;
