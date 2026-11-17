import { useState } from 'react';
import { Layers } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackTitle = 'QUBEX TECH SOLUTIONS',
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200/70 to-blue-50 text-slate-600 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Layers className="w-7 h-7 text-[#1E40AF] mb-2" aria-hidden="true" />
        <span className="text-xs font-medium tracking-tight text-slate-700">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      loading="lazy"
      className={className}
    />
  );
}
