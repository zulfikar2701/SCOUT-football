export function SkeletonRows({ count = 12 }: { count?: number }) {
  return (
    <div style={{ flex: 1, padding: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', height: 34, borderBottom: '1px solid var(--color-border-dim)', alignItems: 'center', padding: '0 12px', gap: 12 }}>
          <div className="skeleton" style={{ width: 24, height: 12 }} />
          <div className="skeleton" style={{ width: 160, height: 12 }} />
          <div className="skeleton" style={{ width: 100, height: 12 }} />
          <div className="skeleton" style={{ width: 40, height: 12 }} />
          <div className="skeleton" style={{ flex: 1, height: 12 }} />
        </div>
      ))}
    </div>
  );
}
