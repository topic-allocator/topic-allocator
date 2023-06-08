import { forwardRef } from 'react';
import { cn } from '../../utils';

const Input = forwardRef<HTMLInputElement, JSX.IntrinsicElements['input']>(function Input(
  { ...props },
  ref,
) {
  return (
    <input ref={ref} className={cn('rounded-md border px-3 py-1', props.className)} {...props} />
  );
});

export default Input;
