export function RetroToggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
    >
      <span
        style={{
          width: 34,
          height: 18,
          background: on ? 'var(--color-accent-amber)' : 'var(--color-bg-elevated)',
          border: '1px solid',
          borderColor: on ? 'var(--color-accent-amber)' : 'var(--color-border-mid)',
          borderRadius: 10,
          position: 'relative',
          transition: 'background 140ms, border-color 140ms',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 1,
            left: on ? 17 : 1,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: on ? 'var(--color-bg-deep)' : 'var(--color-text-muted)',
            transition: 'left 140ms',
          }}
        />
      </span>
      {label && (
        <span className="label" style={{ fontSize: 11, color: on ? 'var(--color-text-amber)' : 'var(--color-text-secondary)' }}>
          {label}
        </span>
      )}
    </button>
  );
}
