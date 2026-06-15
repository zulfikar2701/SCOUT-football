interface Option {
  value: string;
  label: string;
}

export function RetroSelect({
  value,
  options,
  onChange,
  ariaLabel,
  width,
}: {
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  ariaLabel?: string;
  width?: number | string;
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', width }}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mono"
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-mid)',
          borderTopColor: 'var(--color-border-hi)',
          color: 'var(--color-text-primary)',
          fontSize: 12,
          padding: '5px 26px 5px 10px',
          borderRadius: 0,
          width: '100%',
          cursor: 'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: 'var(--color-bg-elevated)' }}>
            {o.label}
          </option>
        ))}
      </select>
      <span
        className="mono"
        style={{
          position: 'absolute',
          right: 9,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--color-accent-amber)',
          fontSize: 9,
        }}
      >
        ▼
      </span>
    </div>
  );
}
