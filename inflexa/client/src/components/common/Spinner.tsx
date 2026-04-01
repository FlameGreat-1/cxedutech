interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const dotSizeMap = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
};

const gapMap = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-2.5',
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`flex items-center ${gapMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className={`${dotSizeMap[size]} rounded-full bg-brand-600 animate-dot-pulse`} style={{ animationDelay: '0ms' }} />
      <span className={`${dotSizeMap[size]} rounded-full bg-brand-600 animate-dot-pulse`} style={{ animationDelay: '160ms' }} />
      <span className={`${dotSizeMap[size]} rounded-full bg-brand-600 animate-dot-pulse`} style={{ animationDelay: '320ms' }} />
    </div>
  );
}
