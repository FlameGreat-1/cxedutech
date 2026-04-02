interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border',
  md: 'h-8 w-8 border-[1.5px]',
  lg: 'h-12 w-12 border-2',
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-teal-100 border-t-teal-400 ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
