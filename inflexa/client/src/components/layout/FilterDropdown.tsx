import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface FilterOption {
  label: string;
  params: Record<string, string>;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  icon?: React.ReactNode;
  align?: 'left' | 'right';
}

export default function FilterDropdown({ label, options, icon, align = 'left' }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  }

  function handleOptionClick(option: FilterOption) {
    const params = new URLSearchParams(option.params);
    navigate(`/store?${params.toString()}`);
    setOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold rounded-xl border transition-all duration-200
          ${
            open
              ? 'bg-brand-50 text-brand-800 border-brand-200 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {icon && <span className="w-[18px] h-[18px] shrink-0">{icon}</span>}
        {label}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div
        className={`fixed sm:absolute top-auto sm:top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl
          transition-all duration-200 z-50
          left-4 right-4
          ${align === 'right'
            ? 'sm:right-0 sm:left-auto origin-top-right'
            : 'sm:left-0 sm:right-auto origin-top-left'
          }
          ${options.length > 4 ? 'sm:w-[440px]' : 'sm:w-[340px]'}
          ${open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
          }`}
        role="menu"
      >
        <div className="p-2.5">
          <p className="px-3 pt-1 pb-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <div className={`grid gap-1 ${options.length > 4 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOptionClick(option)}
                className="text-left px-3.5 py-3 text-[15px] text-gray-700 hover:bg-brand-50 hover:text-brand-800
                  transition-colors duration-150 rounded-xl font-medium"
                role="menuitem"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
