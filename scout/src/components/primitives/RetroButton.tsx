import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  accent?: 'amber' | 'cyan';
}

export function RetroButton({ active, accent = 'amber', style, children, ...rest }: Props) {
  const accentColor = accent === 'cyan' ? 'var(--color-accent-cyan)' : 'var(--color-accent-amber)';
  return (
    <button
      {...rest}
      className="label"
      data-active={active ? 'true' : undefined}
      style={{
        fontSize: 11,
        padding: '6px 12px',
        border: '1px solid',
        borderColor: active ? accentColor : 'var(--color-border-hi)',
        background: active ? accentColor : 'transparent',
        color: active ? 'var(--color-bg-deep)' : 'var(--color-text-secondary)',
        borderRadius: 0,
        transition: 'border-color 120ms, color 120ms, background 120ms',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = accentColor;
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--color-border-hi)';
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }
      }}
    >
      {children}
    </button>
  );
}
