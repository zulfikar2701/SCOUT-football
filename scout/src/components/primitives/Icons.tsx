// Hand-coded inline SVG glyphs — no emoji (§4.1)
import type { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

// Scanline-styled football / scout mark: circle with grid-cross detail (§1.3)
export function ScoutMark({ size = 24, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <path d="M12 7.5l3.2 2.3-1.2 3.7h-4L8.8 9.8 12 7.5z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.18" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function XLogo({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

export function SearchIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRight({ size = 12, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={className} style={style} aria-hidden>
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ size = 14, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className} style={style} aria-hidden>
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ size = 14, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className} style={style} aria-hidden>
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Diamond({ size = 12, filled = true, className, style }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} style={style} aria-hidden>
      <path
        d="M6 0.5L11.5 6 6 11.5 0.5 6z"
        fill={filled ? 'var(--color-accent-amber)' : 'none'}
        stroke={filled ? 'var(--color-accent-amber)' : 'var(--color-border-mid)'}
        strokeWidth="1"
      />
    </svg>
  );
}
