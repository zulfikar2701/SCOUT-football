import { useState, type ReactNode } from 'react';
import { ChevronRight } from '../primitives/Icons';

export function CollapsibleGroup({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--color-border-dim)', padding: '10px 12px' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="label"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          fontSize: 11,
          color: 'var(--color-text-muted)',
        }}
        aria-expanded={open}
      >
        <ChevronRight
          size={9}
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 180ms' }}
        />
        {title}
      </button>
      <div
        style={{
          overflow: 'hidden',
          maxHeight: open ? 600 : 0,
          opacity: open ? 1 : 0,
          transition: 'max-height 200ms ease-in-out, opacity 200ms ease-in-out',
          marginTop: open ? 10 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
