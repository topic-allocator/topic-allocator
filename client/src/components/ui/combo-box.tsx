import { useMemo, useRef, useState } from 'react';
import { cn } from '@/utils';
import { MagnifyingGlassIcon, CaretSortIcon } from '@radix-ui/react-icons';
import Input from '@/components/ui/input';
import { useLabels } from '@/contexts/labels/label-context';
import Spinner from './spinner';

type Option = {
  value: string | number;
  label: string;
};

type ComboBoxProps = {
  value?: Option['value'];
  isLoading?: boolean;
  options: Option[];
  onChange: (value: Option['value']) => void;
  withoutSearch?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
} & Omit<JSX.IntrinsicElements['button'], 'onChange'>;

export default function ComboBox({
  value,
  options,
  className,
  withoutSearch,
  isLoading,
  onChange,
  placeholder,
  icon,
  ...props
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { labels } = useLabels();

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [options, searchTerm],
  );

  function handleSelect(option: Option) {
    onChange(option.value);
    setIsOpen(false);
  }

  function handleClickOutside(e: MouseEvent) {
    const element = popupRef.current;
    if (!element) {
      return;
    }

    if (e.target === buttonRef.current) {
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
      closePopup();
    }
  }

  function closePopup() {
    setIsOpen(false);
    document.removeEventListener('click', handleClickOutside);
  }

  function openPupup() {
    setIsOpen(true);
    setSearchTerm('');

    document.removeEventListener('click', handleClickOutside);
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      searchInputRef.current?.focus();
    });
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
        ref={buttonRef}
        type="button"
        className={cn(
          'w-full min-w-[13rem] rounded-md border bg-white px-3 py-1 text-left transition hover:bg-gray-100',
          className,
          {
            'pointer-events-none': isLoading,
          },
        )}
        onClick={() => (isOpen ? closePopup() : openPupup())}
        {...props}
      >
        <span
          className={cn('pointer-events-none', {
            'text-gray-400':
              value === null || value === undefined || value === '',
          })}
        >
          {isLoading ? (
            <Spinner width={20} height={20} />
          ) : (
            options.find((option) => option.value === value)?.label ??
            placeholder ??
            `${labels.SELECT}...`
          )}
        </span>

        {icon || (
          <CaretSortIcon className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        )}
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          className="absolute top-[105%] z-10 w-full animate-pop-in rounded-md border bg-white shadow-md"
        >
          {!withoutSearch && (
            <div className="relative flex">
              <Input
                ref={searchInputRef}
                role="search"
                className="flex-1 rounded-md border-none p-1 py-2 focus:outline-none"
                placeholder={`${labels.SEARCH}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeydown}
              />
              <MagnifyingGlassIcon className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          )}

          <ul
            className={cn('max-h-52 w-full overflow-x-auto p-1', {
              'border-t': !withoutSearch,
            })}
          >
            {filteredOptions.length === 0 ? (
              <span className="whitespace-break-spaces px-3 py-1">
                {labels.NO_RECORDS_FOUND}
              </span>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  role="button"
                  onClickCapture={() => handleSelect(option)}
                  className="cursor-pointer rounded-md px-3 py-1 transition hover:bg-neutral-100"
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
