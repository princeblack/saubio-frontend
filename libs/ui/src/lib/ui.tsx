import { forwardRef, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';

const joinClasses = (...values: Array<string | undefined | null | false>) =>
  values.filter(Boolean).join(' ');

type ButtonVariant = 'primary' | 'outline';

const baseButtonClasses =
  'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saubio-sun';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-saubio-forest text-white hover:bg-saubio-moss',
  outline:
    'border border-saubio-forest/20 text-saubio-forest hover:border-saubio-forest/40',
};

export interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function PrimaryButton({
  variant = 'primary',
  className,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={joinClasses(baseButtonClasses, variantClasses[variant], className)}
      {...props}
    />
  );
}

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'forest' | 'sun' | 'mist';
}

const pillToneClasses: Record<NonNullable<PillProps['tone']>, string> = {
  forest: 'bg-saubio-forest text-white',
  sun: 'bg-saubio-sun text-saubio-forest',
  mist: 'bg-saubio-mist text-saubio-forest',
};

export function Pill({ tone = 'mist', className, ...props }: PillProps) {
  return (
    <span
      className={joinClasses(
        'inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]',
        pillToneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export { LoadingIndicator } from './loading-indicator';

type SectionPadding = 'compact' | 'default' | 'spacious' | 'none';

const sectionPaddingClasses: Record<SectionPadding, string> = {
  compact: 'px-6 py-12 sm:px-8',
  default: 'px-6 py-16 sm:px-10',
  spacious: 'px-6 py-24 sm:px-16',
  none: '',
};

type SectionMaxWidth = 'narrow' | 'default' | 'wide' | 'full';
type SectionBackground = 'transparent' | 'mist' | 'cream' | 'hero';

const sectionMaxWidthClasses: Record<SectionMaxWidth, string> = {
  narrow: 'max-w-4xl',
  default: 'max-w-7xl',
  wide: 'max-w-6xl lg:max-w-[92rem]',
  full: 'max-w-none',
};

const sectionBackgroundClasses: Record<SectionBackground, string> = {
  transparent: '',
  mist: 'rounded-5xl bg-saubio-mist/40',
  cream: 'rounded-5xl bg-saubio-cream/60',
  hero: 'rounded-5xl bg-hero-gradient text-white',
};

type SectionContainerProps<E extends ElementType = 'section'> = {
  as?: E;
  centered?: boolean;
  padding?: SectionPadding;
  maxWidth?: SectionMaxWidth;
  background?: SectionBackground;
  className?: string;
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'className'>;

export function SectionContainer<E extends ElementType = 'section'>({
  as,
  centered = true,
  padding = 'default',
  maxWidth = 'default',
  background = 'transparent',
  className,
  ...props
}: SectionContainerProps<E>) {
  const Component = (as ?? 'section') as ElementType;

  return (
    <Component
      className={joinClasses(
        'w-full',
        sectionPaddingClasses[padding],
        centered ? joinClasses('mx-auto', sectionMaxWidthClasses[maxWidth]) : undefined,
        background !== 'transparent' ? sectionBackgroundClasses[background] : undefined,
        className
      )}
      {...props}
    />
  );
}

type SectionHeadingTone = 'moss' | 'sun' | 'forest' | 'cream';

const sectionHeadingToneClasses: Record<SectionHeadingTone, string> = {
  moss: 'text-saubio-moss',
  sun: 'text-saubio-sun',
  forest: 'text-saubio-forest',
  cream: 'text-saubio-cream',
};

export interface SectionHeadingProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: SectionHeadingTone;
}

export function SectionHeading({
  tone = 'moss',
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <span
      className={joinClasses(
        'text-sm font-semibold uppercase tracking-[0.3em]',
        sectionHeadingToneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

type SectionTitleSize = 'default' | 'large';
type SectionTitleAlign = 'left' | 'center';

const sectionTitleSizeClasses: Record<SectionTitleSize, string> = {
  default: 'text-4xl font-semibold text-saubio-forest sm:text-5xl',
  large: 'text-5xl font-semibold text-saubio-forest sm:text-6xl',
};

const sectionTitleAlignClasses: Record<SectionTitleAlign, string> = {
  left: 'text-left',
  center: 'text-center mx-auto',
};

type SectionTitleProps<E extends ElementType = 'h2'> = {
  as?: E;
  size?: SectionTitleSize;
  align?: SectionTitleAlign;
  className?: string;
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'className'>;

export function SectionTitle<E extends ElementType = 'h2'>({
  as,
  size = 'default',
  align = 'left',
  className,
  ...props
}: SectionTitleProps<E>) {
  const Component = (as ?? 'h2') as ElementType;

  return (
    <Component
      className={joinClasses(
        sectionTitleSizeClasses[size],
        sectionTitleAlignClasses[align],
        className
      )}
      {...props}
    />
  );
}

type SectionDescriptionSize = 'default' | 'large';
type SectionDescriptionAlign = 'left' | 'center';

const sectionDescriptionSizeClasses: Record<SectionDescriptionSize, string> = {
  default: 'mt-4 max-w-2xl text-lg text-saubio-slate/80 sm:text-xl',
  large: 'mt-5 max-w-3xl text-xl text-saubio-slate/80 sm:text-2xl',
};

const sectionDescriptionAlignClasses: Record<SectionDescriptionAlign, string> = {
  left: 'text-left',
  center: 'text-center mx-auto',
};

export interface SectionDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {
  size?: SectionDescriptionSize;
  align?: SectionDescriptionAlign;
}

export function SectionDescription({
  size = 'default',
  align = 'left',
  className,
  ...props
}: SectionDescriptionProps) {
  return (
    <p
      className={joinClasses(
        sectionDescriptionSizeClasses[size],
        sectionDescriptionAlignClasses[align],
        className
      )}
      {...props}
    />
  );
}

type SurfaceCardVariant = 'default' | 'soft' | 'cream' | 'dark';
type SurfaceCardPadding = 'none' | 'sm' | 'md' | 'lg';

const surfaceVariantClasses: Record<SurfaceCardVariant, string> = {
  default: 'bg-white text-saubio-slate',
  soft: 'bg-saubio-mist text-saubio-forest',
  cream: 'bg-saubio-cream text-saubio-forest',
  dark: 'bg-saubio-forest text-white',
};

const surfacePaddingClasses: Record<SurfaceCardPadding, string> = {
  none: '',
  sm: 'p-4 sm:p-6',
  md: 'p-6 sm:p-8',
  lg: 'p-8 sm:p-12',
};

export interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceCardVariant;
  padding?: SurfaceCardPadding;
  elevated?: boolean;
  withBorder?: boolean;
}

export function SurfaceCard({
  variant = 'default',
  padding = 'md',
  elevated = true,
  withBorder = false,
  className,
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={joinClasses(
        'rounded-4xl',
        surfaceVariantClasses[variant],
        surfacePaddingClasses[padding],
        elevated ? 'shadow-soft-lg' : undefined,
        withBorder ? 'border border-saubio-forest/10' : undefined,
        className
      )}
      {...props}
    />
  );
}

type AnalyticsCardVariant = 'light' | 'glass';

const analyticsVariantClasses: Record<AnalyticsCardVariant, string> = {
  light:
    'bg-white text-saubio-forest border border-saubio-forest/10 shadow-soft-lg',
  glass:
    'bg-white/10 text-white border border-white/25 shadow-soft-lg backdrop-blur',
};

const analyticsIconVariantClasses: Record<AnalyticsCardVariant, string> = {
  light: 'bg-saubio-mist text-saubio-forest',
  glass: 'bg-white/10 text-white',
};

export interface AnalyticsCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  variant?: AnalyticsCardVariant;
  align?: 'left' | 'center' | 'right';
}

export function AnalyticsCard({
  label,
  value,
  helper,
  icon,
  variant = 'light',
  align = 'left',
  className,
  children,
  ...props
}: AnalyticsCardProps) {
  return (
    <div
      className={joinClasses(
        'rounded-3xl p-5 sm:p-6',
        analyticsVariantClasses[variant],
        align === 'center' ? 'text-center' : undefined,
        align === 'right' ? 'text-right' : undefined,
        className
      )}
      {...props}
    >
      <div className={joinClasses('flex items-center gap-3', align === 'right' ? 'justify-end' : 'justify-between')}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-70">
          {label}
        </span>
        {icon ? (
          <span
            className={joinClasses(
              'flex h-9 w-9 items-center justify-center rounded-2xl text-base',
              analyticsIconVariantClasses[variant]
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-semibold sm:text-4xl">{value}</p>
      {helper ? (
        <p className="mt-2 text-sm opacity-80">{helper}</p>
      ) : null}
      {children}
    </div>
  );
}

type InfoTileTone = 'neutral' | 'accent' | 'positive' | 'inverse';
type InfoTileLayout = 'vertical' | 'horizontal';

const infoTileToneClasses: Record<InfoTileTone, string> = {
  neutral: 'bg-white text-saubio-slate',
  accent: 'bg-saubio-sun text-saubio-forest',
  positive: 'bg-saubio-mist text-saubio-forest',
  inverse: 'bg-saubio-forest text-white',
};

const infoTileDescriptionClasses: Record<InfoTileTone, string> = {
  neutral: 'text-saubio-slate/75',
  accent: 'text-saubio-forest/80',
  positive: 'text-saubio-forest/80',
  inverse: 'text-white/80',
};

const infoTileIconClasses: Record<InfoTileTone, string> = {
  neutral: 'bg-saubio-mist text-saubio-forest',
  accent: 'bg-white/70 text-saubio-forest',
  positive: 'bg-white text-saubio-forest',
  inverse: 'bg-white/10 text-white',
};

const infoTileLayoutClasses: Record<InfoTileLayout, string> = {
  vertical: 'flex flex-col gap-4',
  horizontal: 'flex items-start gap-4',
};

export interface InfoTileProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  tone?: InfoTileTone;
  layout?: InfoTileLayout;
}

export function InfoTile({
  icon,
  title,
  description,
  tone = 'neutral',
  layout = 'vertical',
  className,
  children,
  ...props
}: InfoTileProps) {
  return (
    <div
      className={joinClasses(
        'rounded-3xl',
        infoTileToneClasses[tone],
        infoTileLayoutClasses[layout],
        'p-6 sm:p-7',
        className
      )}
      {...props}
    >
      {icon ? (
        <div
          className={joinClasses(
            'flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold',
            infoTileIconClasses[tone]
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <div className="space-y-2">
        <p className="text-lg font-semibold">{title}</p>
        {description ? (
          <p className={joinClasses('text-sm leading-relaxed', infoTileDescriptionClasses[tone])}>
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

const carouselFadeClass = 'after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-16 after:bg-gradient-to-r after:from-transparent after:to-saubio-mist/60';

export interface ScrollCarouselProps extends HTMLAttributes<HTMLDivElement> {
  snap?: 'start' | 'center' | 'none';
}

export function ScrollCarousel({ snap = 'start', className, children, ...props }: ScrollCarouselProps) {
  return (
    <div
      className={joinClasses(
        'relative',
        snap !== 'none' ? carouselFadeClass : undefined,
        className
      )}
      {...props}
    >
      <div
        className={joinClasses(
          'flex gap-4 overflow-x-auto pb-4',
          snap !== 'none' ? `snap-x snap-${snap}` : undefined
        )}
      >
        {children}
      </div>
    </div>
  );
}

type FeatureTileTone = 'default' | 'highlight' | 'outlined';

const featureToneClasses: Record<FeatureTileTone, string> = {
  default: 'bg-white border border-saubio-forest/10 shadow-soft-lg',
  highlight: 'bg-saubio-forest text-white shadow-soft-lg',
  outlined: 'bg-white border border-saubio-forest/20',
};

export interface FeatureTileProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: ReactNode;
  tone?: FeatureTileTone;
  cta?: ReactNode;
}

export function FeatureTile({
  title,
  description,
  eyebrow,
  icon,
  tone = 'default',
  cta,
  className,
  children,
  ...props
}: FeatureTileProps) {
  return (
    <div
      className={joinClasses(
        'flex h-full flex-col rounded-4xl p-6 transition-transform hover:-translate-y-1',
        featureToneClasses[tone],
        className
      )}
      {...props}
    >
      {eyebrow ? (
        <span className="mb-3 inline-flex rounded-full bg-saubio-mist/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-saubio-forest">
          {eyebrow}
        </span>
      ) : null}
      {icon ? (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-saubio-mist/40 text-lg text-saubio-forest">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-saubio-slate/70">{description}</p>
      ) : null}
      {children}
      {cta ? <div className="mt-6">{cta}</div> : null}
    </div>
  );
}

export interface FeatureGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3;
}

export function FeatureGrid({ columns = 3, className, ...props }: FeatureGridProps) {
  const gridClass =
    columns === 1 ? 'grid-cols-1' : columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3';

  return (
    <div className={joinClasses('grid gap-6', gridClass, className)} {...props} />
  );
}

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  hint?: string;
  requiredMark?: boolean;
  layout?: 'vertical' | 'horizontal';
  htmlFor?: string;
  description?: ReactNode;
  error?: ReactNode;
  requiredIndicator?: ReactElement;
  labelAction?: ReactNode;
}

export function FormField({
  label,
  hint,
  requiredMark = false,
  layout = 'vertical',
  htmlFor,
  description,
  error,
  requiredIndicator,
  labelAction,
  className,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div
      className={joinClasses(
        layout === 'vertical'
          ? 'flex flex-col gap-2'
          : 'flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4',
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1 text-sm font-semibold text-saubio-slate">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={htmlFor} className="text-sm font-semibold text-saubio-slate">
            <span>{label}</span>
            {requiredMark ? <span className="text-saubio-sun"> *</span> : null}
            {requiredIndicator ?? null}
          </label>
          {labelAction ? (
            <div className="text-xs font-semibold text-saubio-forest/80">{labelAction}</div>
          ) : null}
        </div>
        {hint ? (
          <span className="text-xs font-normal text-saubio-slate/70">{hint}</span>
        ) : null}
      </div>
      <div className="flex-1">{children}</div>
      {description ? (
        <p className="text-sm text-saubio-slate/70">{description}</p>
      ) : null}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

type StackDirection = 'row' | 'column';
type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around';

const stackDirectionClasses: Record<StackDirection, string> = {
  row: 'flex-row',
  column: 'flex-col',
};

const stackGapClasses: Record<StackGap, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const stackAlignClasses: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const stackJustifyClasses: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
}

export function Stack({
  direction = 'column',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={joinClasses(
        'flex',
        stackDirectionClasses[direction],
        stackGapClasses[gap],
        stackAlignClasses[align],
        stackJustifyClasses[justify],
        wrap ? 'flex-wrap' : undefined,
        className
      )}
      {...props}
    />
  );
}

type SimpleGridGap = StackGap | '2xl';

const simpleGridGapClasses: Record<SimpleGridGap, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

type ColumnConfig = number | { base?: number; sm?: number; md?: number; lg?: number };

const columnClass = (prefix: string | null, count?: number) => {
  if (!count) return undefined;
  const base =
    count >= 1 && count <= 6
      ? `grid-cols-${count}`
      : `grid-cols-[repeat(${count},minmax(0,1fr))]`;
  if (!base) {
    return undefined;
  }
  return prefix ? `${prefix}:${base}` : base;
};

export interface SimpleGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: ColumnConfig;
  gap?: SimpleGridGap;
}

export function SimpleGrid({
  columns = { base: 1, sm: 2, md: 3 },
  gap = 'md',
  className,
  ...props
}: SimpleGridProps) {
  const config = typeof columns === 'number' ? { base: columns } : columns;

  const baseClass = columnClass(null, config.base);
  const smClass = columnClass('sm', config.sm);
  const mdClass = columnClass('md', config.md);
  const lgClass = columnClass('lg', config.lg);

  return (
    <div
      className={joinClasses(
        'grid',
        simpleGridGapClasses[gap],
        baseClass,
        smClass,
        mdClass,
        lgClass,
        className
      )}
      {...props}
    />
  );
}

type CarouselGap = 'sm' | 'md' | 'lg';

const carouselGapClasses: Record<CarouselGap, string> = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
  gap?: CarouselGap;
  scrollOffset?: number;
  children: ReactNode;
}

export function Carousel({
  ariaLabel = 'carousel',
  gap = 'md',
  scrollOffset = 340,
  className,
  children,
  ...props
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 'prev' | 'next') => {
    const node = trackRef.current;
    if (!node) return;
    const amount = direction === 'next' ? scrollOffset : -scrollOffset;
    node.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className={joinClasses('relative', className)} {...props}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent" />
      <div className="flex items-center justify-between gap-3 pb-4">
        <button
          type="button"
          onClick={() => scrollBy('prev')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-saubio-forest/20 bg-white text-saubio-forest shadow-soft-sm transition hover:border-saubio-forest/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saubio-sun"
          aria-label="Scroll carousel backwards"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => scrollBy('next')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-saubio-forest/20 bg-white text-saubio-forest shadow-soft-sm transition hover:border-saubio-forest/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saubio-sun"
          aria-label="Scroll carousel forwards"
        >
          ›
        </button>
      </div>
      <div
        ref={trackRef}
        role="group"
        aria-label={ariaLabel}
        className={joinClasses(
          'flex snap-x snap-mandatory overflow-x-auto scroll-smooth',
          carouselGapClasses[gap],
          'pb-4'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export interface CarouselItemProps extends HTMLAttributes<HTMLDivElement> {
  width?: 'xs' | 'sm' | 'md' | 'lg';
}

const carouselItemWidthClasses: Record<NonNullable<CarouselItemProps['width']>, string> = {
  xs: 'min-w-[220px]',
  sm: 'min-w-[260px]',
  md: 'min-w-[320px]',
  lg: 'min-w-[420px]',
};

export function CarouselItem({ width = 'md', className, ...props }: CarouselItemProps) {
  return (
    <div
      className={joinClasses(
        'snap-start',
        carouselItemWidthClasses[width],
        'flex-shrink-0',
        className
      )}
      {...props}
    />
  );
}

type TextFieldTone = 'default' | 'forest' | 'mist';

const textFieldToneClasses: Record<TextFieldTone, string> = {
  default: 'border-saubio-forest/15 focus:border-saubio-forest',
  forest: 'border-saubio-forest/30 bg-saubio-forest/5 focus:border-saubio-forest',
  mist: 'border-saubio-mist/60 bg-saubio-mist/30 focus:border-saubio-forest',
};

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  tone?: TextFieldTone;
  hasError?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { tone = 'default', hasError = false, className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={joinClasses(
        'w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-1 focus:ring-saubio-forest/40',
        hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-400/50' : textFieldToneClasses[tone],
        className
      )}
      aria-invalid={hasError || undefined}
      {...props}
    />
  );
});

type SelectFieldTone = TextFieldTone;

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  tone?: SelectFieldTone;
  hasError?: boolean;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { tone = 'default', hasError = false, className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={joinClasses(
        'w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-1 focus:ring-saubio-forest/40',
        hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-400/50' : textFieldToneClasses[tone],
        className
      )}
      aria-invalid={hasError || undefined}
      {...props}
    >
      {children}
    </select>
  );
});

export interface IconBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'forest' | 'sun' | 'mist' | 'inverse';
  size?: 'sm' | 'md';
  icon?: ReactNode;
}

const iconBadgeToneClasses: Record<NonNullable<IconBadgeProps['tone']>, string> = {
  forest: 'bg-saubio-forest text-white',
  sun: 'bg-saubio-sun text-saubio-forest',
  mist: 'bg-saubio-mist text-saubio-forest',
  inverse: 'bg-saubio-forest/10 text-saubio-forest',
};

const iconBadgeSizeClasses: Record<NonNullable<IconBadgeProps['size']>, string> = {
  sm: 'h-8 w-8 text-base',
  md: 'h-10 w-10 text-lg',
};

export function IconBadge({
  tone = 'forest',
  size = 'md',
  icon,
  children,
  className,
  ...props
}: IconBadgeProps) {
  return (
    <span
      className={joinClasses(
        'inline-flex items-center justify-center rounded-full',
        iconBadgeToneClasses[tone],
        iconBadgeSizeClasses[size],
        className
      )}
      {...props}
    >
      {icon ?? children}
    </span>
  );
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const skeletonRadius: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  none: 'rounded-none',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-3xl',
  full: 'rounded-full',
};

export function Skeleton({ className, rounded = 'lg', ...props }: SkeletonProps) {
  return (
    <div
      className={joinClasses(
        'animate-pulse bg-saubio-mist/60',
        skeletonRadius[rounded],
        className
      )}
      {...props}
    />
  );
}

export interface ErrorBannerProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorBanner({ title, description, actionLabel, onAction }: ErrorBannerProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
      <div>
        <p className="text-base font-semibold">{title}</p>
        {description ? <p className="mt-1 text-red-600/80">{description}</p> : null}
      </div>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="rounded-full border border-red-400/60 px-4 py-2 text-xs font-semibold text-red-700 transition hover:border-red-500 hover:text-red-800"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

type ToastVariant = 'success' | 'info' | 'warning' | 'danger';
type ToastPlacement = 'top' | 'bottom';
type ToastActionStyle = 'solid' | 'ghost';

const toastVariantClasses: Record<ToastVariant, { container: string; icon: string; border: string }> = {
  success: {
    container: 'bg-white text-saubio-forest',
    icon: 'bg-saubio-mist text-saubio-forest',
    border: 'border-saubio-forest/10',
  },
  info: {
    container: 'bg-white text-saubio-slate',
    icon: 'bg-saubio-mist/60 text-saubio-forest',
    border: 'border-saubio-mist/40',
  },
  warning: {
    container: 'bg-saubio-sun/10 text-saubio-forest',
    icon: 'bg-saubio-sun/80 text-saubio-forest',
    border: 'border-saubio-sun/40',
  },
  danger: {
    container: 'bg-red-50 text-red-800',
    icon: 'bg-red-100 text-red-600',
    border: 'border-red-200',
  },
};

const toastIcons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  danger: <XCircle className="h-5 w-5" />,
};

const toastPlacementClasses: Record<ToastPlacement, string> = {
  top: 'top-6',
  bottom: 'bottom-6',
};

const toastActionClasses: Record<ToastActionStyle, string> = {
  solid: 'bg-saubio-forest text-white hover:bg-saubio-moss',
  ghost: 'border border-saubio-forest/30 text-saubio-forest hover:border-saubio-forest/50',
};

export interface ToastAction {
  label: string;
  onClick: () => void;
  style?: ToastActionStyle;
}

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  variant?: ToastVariant;
  placement?: ToastPlacement;
  title?: string;
  description?: string;
  actions?: ToastAction[];
  dismissLabel?: string;
  onDismiss?: () => void;
  icon?: ReactNode;
  maxWidthClass?: string;
}

export function Toast({
  open,
  variant = 'success',
  placement = 'bottom',
  title,
  description,
  actions,
  dismissLabel,
  onDismiss,
  icon,
  className,
  maxWidthClass,
  ...props
}: ToastProps) {
  if (!open) {
    return null;
  }

  const tone = toastVariantClasses[variant];
  const placementClass = toastPlacementClasses[placement];
  const resolvedIcon = icon ?? toastIcons[variant];

  return (
    <div
      className={joinClasses(
        'fixed left-1/2 z-[60] w-[calc(100%-32px)] -translate-x-1/2 rounded-3xl border shadow-soft-lg transition',
        placementClass,
        tone.container,
        tone.border,
        maxWidthClass ?? 'max-w-md'
      )}
      {...props}
    >
      <div className={joinClasses('flex gap-4 px-6 py-5', className)}>
        <div
          className={joinClasses(
            'flex h-10 w-10 items-center justify-center rounded-2xl',
            tone.icon
          )}
          aria-hidden="true"
        >
          {resolvedIcon}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          {(title || description) && (
            <div>
              {title ? (
                <p className="text-sm font-semibold uppercase tracking-[0.22em]">{title}</p>
              ) : null}
              {description ? (
                <p className="text-sm text-current/80">{description}</p>
              ) : null}
            </div>
          )}
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            {actions?.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={joinClasses(
                  'rounded-full px-4 py-2 transition',
                  toastActionClasses[action.style ?? 'solid']
                )}
              >
                {action.label}
              </button>
            ))}
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className={joinClasses(
                  'rounded-full px-4 py-2 text-xs font-semibold transition',
                  actions?.length ? toastActionClasses.ghost : toastActionClasses.ghost
                )}
              >
                {dismissLabel ?? 'Close'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
