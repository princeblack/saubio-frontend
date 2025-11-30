export type LoadingIndicatorSize = 'xs' | 'sm' | 'md';
export type LoadingIndicatorTone = 'light' | 'dark';

const sizeClasses: Record<LoadingIndicatorSize, string> = {
  xs: 'h-3 w-3 border-2',
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
};

const toneClasses: Record<LoadingIndicatorTone, string> = {
  light: 'border-white/60 border-t-white',
  dark: 'border-saubio-forest/20 border-t-saubio-forest',
};

export interface LoadingIndicatorProps {
  size?: LoadingIndicatorSize;
  tone?: LoadingIndicatorTone;
  label?: string;
  className?: string;
}

export function LoadingIndicator({
  size = 'sm',
  tone = 'dark',
  label = 'Loading…',
  className,
}: LoadingIndicatorProps) {
  const spinnerClasses = `inline-block animate-spin rounded-full border-solid ${sizeClasses[size]} ${toneClasses[tone]} ${className ?? ''}`.trim();

  return (
    <span className="relative inline-flex items-center justify-center" role="status" aria-label={label}>
      <span className={spinnerClasses} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
