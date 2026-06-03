import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { classNames } from '../../utils/classNames';

export type SelectComboboxOption = {
  value: string;
  label: string;
};

export function SelectCombobox({
  label,
  value,
  options,
  onChange,
  placeholder,
  icon,
  disabled,
}: {
  label: string;
  value: string;
  options: SelectComboboxOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, options.findIndex((option) => option.value === value)));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (open) setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
  }, [open, options, value]);

  function select(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(options.length - 1, index + 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.max(0, index - 1));
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) select(options[activeIndex]?.value ?? value);
      else setOpen(true);
    }
    if (event.key === 'Escape') setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <span className="mb-1.5 block text-[13px] font-extrabold uppercase tracking-wide text-slate-500">{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onKeyDown}
        className={classNames(
          'group flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-left text-[15px] font-bold text-ink shadow-sm transition-all duration-200 focus:border-ocean focus:outline-none focus:ring-4 focus:ring-ocean/15',
          open && 'border-ocean ring-4 ring-ocean/10',
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-slate-300 hover:shadow-soft',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon && <span className="shrink-0 text-slate-400 transition group-hover:text-ocean">{icon}</span>}
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </span>
        <ChevronDown className={classNames('shrink-0 text-slate-400 transition-transform duration-200', open && 'rotate-180 text-ocean')} size={17} />
      </button>
      <div
        className={classNames(
          'absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 origin-top overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lift transition-all duration-200',
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0',
        )}
        role="listbox"
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => select(option.value)}
            className={classNames(
              'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-bold transition',
              option.value === value ? 'bg-mint text-leaf' : index === activeIndex ? 'bg-slate-50 text-ink' : 'text-slate-600 hover:bg-slate-50 hover:text-ink',
            )}
            role="option"
            aria-selected={option.value === value}
          >
            <span>{option.label}</span>
            {option.value === value && <Check size={16} />}
          </button>
        ))}
      </div>
    </div>
  );
}
