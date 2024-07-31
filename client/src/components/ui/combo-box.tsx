import { useMemo, useRef, useState } from 'react';
import { cn } from '@/utils';
import { MagnifyingGlassIcon, CaretSortIcon } from '@radix-ui/react-icons';
import Input from '@/components/ui/input';
import { useLabels } from '@/contexts/labels/label-context';
import Button from './button';

type Option = {
  value: string | number;
  label: string;
};

type ComboBoxProps = {
  value?: Option['value'];
  isPending?: boolean;
  options: Option[];
  onChange: (value: Option['value']) => void;
  withoutSearch?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
} & Omit<JSX.IntrinsicElements['button'], 'onChange'>;

export default function ComboBox({
  value,
  options,
  className,
  withoutSearch,
  isPending,
  onChange,
  placeholder,
  icon,
  fullWidth,
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
    <div
      className={cn('relative w-min', {
        'w-full': fullWidth,
      })}
    >
      <Button
        label={
          <span
            className={cn({
              'text-gray-400':
                value === null || value === undefined || value === '',
            })}
          >
            {options.find((option) => option.value === value)?.label ??
              placeholder ??
              `${labels.SELECT}...`}
          </span>
        }
        icon={icon || <CaretSortIcon />}
        className={cn(
          'btn-neutral w-[13rem] justify-between bg-base-100',
          {
            'w-full': fullWidth,
          },
          className,
        )}
        isPending={isPending}
        onClick={() => (isOpen ? closePopup() : openPupup())}
        {...props}
        ref={buttonRef}
      />

      {isOpen && (
        <div
          ref={popupRef}
          className="card absolute top-[105%] z-10 w-full animate-pop-in rounded-btn bg-neutral shadow-xl"
        >
          {!withoutSearch && (
            <div className="relative flex">
              <Input
                ref={searchInputRef}
                role="search"
                className="flex-1 border-none focus:outline-none"
                placeholder={`${labels.SEARCH}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeydown}
              />
              <MagnifyingGlassIcon className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          )}

          <ul className="max-h-52 w-full overflow-x-auto p-1">
            {filteredOptions.length === 0 ? (
              <span className="whitespace-break-spaces px-3 py-1">
                {labels.NO_RECORDS_FOUND}
              </span>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  role="button"
                  onClick={() => handleSelect(option)}
                  className="cursor-pointer rounded-md px-3 py-1 transition hover:bg-base-200"
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
