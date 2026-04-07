interface ProductImageProps {
  src: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Optional HTML id applied to the <img> element (used for fly-to-cart animation targeting) */
  imageId?: string;
}

const sizeClasses = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-64',
};

export default function ProductImage({ src, alt, size = 'md', className = '', imageId }: ProductImageProps) {
  if (src) {
    return (
      <div className={`${sizeClasses[size]} w-full overflow-hidden bg-gray-100 rounded-lg ${className}`}>
        <img
          id={imageId}
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} w-full overflow-hidden bg-brand-50 rounded-lg
      flex items-center justify-center ${className}`}
    >
      <svg className="w-16 h-16 text-brand-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    </div>
  );
}

