interface BrandLogoProps {
  variant?: 'dark' | 'light';
}

export function BrandLogo({ variant = 'dark' }: BrandLogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#0F172A]';
  const ringClass =
    variant === 'light'
      ? 'ring-1 ring-blue-400/40'
      : 'ring-1 ring-slate-200';
  const sizeClass = variant === 'light' ? 'w-10 h-10' : 'w-9 h-9';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <span
        className={`${sizeClass} rounded-full overflow-hidden bg-black shrink-0 ${ringClass} flex items-center justify-center`}
      >
        <img
          src="/assets/aistudio/logo_a7957b67.jpeg"
          alt="QUBEX TECH SOLUTIONS logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover scale-[1.04]"
        />
      </span>
      <span
        className={`font-display text-[16px] sm:text-[17px] font-bold tracking-[-0.02em] ${textColor}`}
      >
        QUBEX TECH SOLUTIONS
      </span>
    </span>
  );
}
