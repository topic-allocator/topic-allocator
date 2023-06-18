import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../utils';
import { MagnifyingGlassIcon, CaretSortIcon } from '@radix-ui/react-icons';
import Input from './Input';

type Option = {
  value: string | number;
  label: string;
};

type ComboBoxProps = {
  options: Option[];
  onSelect: (value: Option['value']) => void;
  withoutSearch?: boolean;
  placeholder?: string;
  value: Option['value'] | undefined;
} & Omit<JSX.IntrinsicElements['button'], 'onSelect'>;

export default function ComboBox({
  value,
  options,
  className,
  withoutSearch,
  onSelect,
  placeholder,
  ...props
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  useClickOutside(popupRef, () => setIsOpen(false));

  const filteredOptions = useMemo(
    () => options.filter((option) => option.label.includes(searchTerm)),
    [options, searchTerm],
  );

  function handleSelect(option: Option) {
    onSelect(option.value);
    setIsOpen(false);
  }

  function handleKeydown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (['Enter', 'Tab'].includes(e.key)) {
      setIsOpen(false);

      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          'w-full min-w-[13rem] rounded-md border px-3 py-1 text-left transition hover:bg-gray-100',
          className,
        )}
        onClickCapture={() => {
          setIsOpen(!isOpen);
          setSearchTerm('');
          setTimeout(() => searchInputRef.current?.focus());
        }}
        {...props}
      >
        <span
          className={cn('pointer-events-none', {
            'text-gray-400': !value,
          })}
        >
          {options.find((option) => option.value === value)?.label ?? placeholder ?? 'Select...'}
        </span>

        <CaretSortIcon className="pointer-events-none absolute right-2 top-2 h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          className="combo-box-pop-in absolute top-[105%] z-10 w-full rounded-md border bg-white shadow-md"
        >
          {!withoutSearch && (
            <div className="relative flex">
              <Input
                ref={searchInputRef}
                role="search"
                className="flex-1 rounded-none border-none p-1 py-2 focus:outline-none"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeydown}
              />
              <MagnifyingGlassIcon className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          )}

          <ul className="max-h-52 w-full overflow-x-auto border-t p-1">
            {filteredOptions.length === 0 ? (
              <span className="px-3 py-1">No results found.</span>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  role="button"
                  onClickCapture={() => handleSelect(option)}
                  className="cursor-pointer px-3 py-1 transition hover:bg-gray-100"
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void) {
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
      callback();
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
}
