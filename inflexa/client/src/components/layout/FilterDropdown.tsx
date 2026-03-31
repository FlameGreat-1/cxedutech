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
}

export default function FilterDropdown({ label, options, icon }: FilterDropdownProps) {
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

  // Close on outside click (for touch devices)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
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
      {/* Trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
          ${
            open
              ? 'bg-brand-50 text-brand-700'
              : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
          }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {icon && <span className="w-4 h-4">{icon}</span>}
        {label}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown card */}
      <div
        className={`absolute top-full left-0 mt-1 min-w-[200px] bg-white rounded-xl border border-gray-200 shadow-lg
          transition-all duration-200 origin-top z-50
          ${open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
          }`}
        role="menu"
      >
        <div className="py-2">
          {options.map((option) => (
            <button
              key={option.label}
              onClick={() => handleOptionClick(option)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700
                transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
              role="menuitem"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
