import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Player } from '../../lib/types';
import { useFilterStore } from '../../store/filterStore';
import { CATEGORY_METRICS, metricValue, isPer90Active, higherIsBetter } from '../../lib/metrics';
import { buildPercentileIndex } from '../../lib/api';
import { StatCell } from './StatCell';
import { PositionBadge } from '../primitives/PositionBadge';
import { LeagueFlag } from '../primitives/LeagueFlag';
import { fmtNum } from '../../lib/formatters';

const PINNED = [
  { key: 'rank', label: '#', width: 42, align: 'center' as const },
  { key: 'name', label: 'Player', width: 184, align: 'left' as const },
  { key: 'team', label: 'Club', width: 124, align: 'left' as const },
  { key: 'pos', label: 'Pos', width: 48, align: 'center' as const },
  { key: 'age', label: 'Age', width: 42, align: 'center' as const },
  { key: 'matches', label: 'Apps', width: 50, align: 'center' as const },
  { key: 'minutes', label: 'Mins', width: 60, align: 'right' as const },
];
const STAT_W = 78;
const ROW_H = 34;

function leftOffset(i: number): number {
  return PINNED.slice(0, i).reduce((s, c) => s + c.width, 0);
}
const PINNED_W = PINNED.reduce((s, c) => s + c.width, 0);

export function PlayerTable({ rows }: { rows: Player[] }) {
  const navigate = useNavigate();
  const { category, per90, sortBy, sortDir, setSort } = useFilterStore();
  const metrics = CATEGORY_METRICS[category];
  const parentRef = useRef<HTMLDivElement>(null);

  const pIndex = useMemo(
    () => buildPercentileIndex(rows, metrics.map((m) => m.key), per90),
    [rows, metrics, per90],
  );

  const virt = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_H,
    overscan: 20,
  });

  const sortGlyph = (key: string) => (sortBy === key ? (sortDir === 'desc' ? ' ▼' : ' ▲') : '');

  return (
    <div ref={parentRef} style={{ flex: 1, overflow: 'auto', position: 'relative' }} role="grid" aria-rowcount={rows.length}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'var(--color-bg-elevated)',
          borderBottom: '1px solid var(--color-border-mid)',
          height: 30,
          minWidth: PINNED_W + metrics.length * STAT_W,
        }}
      >
        {PINNED.map((c, i) => (
          <HeaderCell
            key={c.key}
            label={c.label}
            width={c.width}
            align={c.align}
            sticky
            left={leftOffset(i)}
            onClick={c.key === 'name' || c.key === 'age' || c.key === 'matches' || c.key === 'minutes' ? () => setSort(c.key) : undefined}
            glyph={sortGlyph(c.key)}
          />
        ))}
        {metrics.map((m) => (
          <HeaderCell
            key={m.key}
            label={m.label + (isPer90Active(m, per90) ? '/90' : '')}
            width={STAT_W}
            align="right"
            onClick={() => setSort(m.key)}
            active={sortBy === m.key}
            glyph={sortGlyph(m.key)}
          />
        ))}
      </div>

      {/* Body */}
      <div style={{ height: virt.getTotalSize(), position: 'relative', minWidth: PINNED_W + metrics.length * STAT_W }}>
        {virt.getVirtualItems().map((vi) => {
          const p = rows[vi.index];
          const odd = vi.index % 2 === 1;
          return (
            <div
              key={p.key}
              role="row"
              onClick={() => navigate(`/players/${p.key}`)}
              className="player-row"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `translateY(${vi.start}px)`,
                display: 'flex',
                height: ROW_H,
                width: '100%',
                minWidth: PINNED_W + metrics.length * STAT_W,
                background: odd ? 'var(--color-bg-surface)' : 'var(--color-bg-base)',
                borderBottom: '1px solid var(--color-border-dim)',
                cursor: 'pointer',
              }}
            >
              <PinnedCell width={PINNED[0].width} left={leftOffset(0)} align="center">
                <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{vi.index + 1}</span>
              </PinnedCell>
              <PinnedCell width={PINNED[1].width} left={leftOffset(1)} align="left">
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              </PinnedCell>
              <PinnedCell width={PINNED[2].width} left={leftOffset(2)} align="left">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LeagueFlag league={p.leagueKey} />
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.team}</span>
                </span>
              </PinnedCell>
              <PinnedCell width={PINNED[3].width} left={leftOffset(3)} align="center">
                <PositionBadge pos={p.posGroup} />
              </PinnedCell>
              <PinnedCell width={PINNED[4].width} left={leftOffset(4)} align="center">
                <span className="mono" style={{ fontSize: 12 }}>{p.age ?? '–'}</span>
              </PinnedCell>
              <PinnedCell width={PINNED[5].width} left={leftOffset(5)} align="center">
                <span className="mono-bold" style={{ fontSize: 13 }}>{p.matches}</span>
              </PinnedCell>
              <PinnedCell width={PINNED[6].width} left={leftOffset(6)} align="right">
                <span className="mono" style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{fmtNum(p.minutes, 0)}</span>
              </PinnedCell>
              {metrics.map((m) => {
                const v = metricValue(m, p, per90);
                const pct = pIndex.pct(m.key, v, higherIsBetter(m.key));
                return <StatCell key={m.key} metric={m} value={v} percentile={pct} width={STAT_W} />;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeaderCell({ label, width, align, sticky, left, onClick, active, glyph }: { label: string; width: number; align: 'left' | 'right' | 'center'; sticky?: boolean; left?: number; onClick?: () => void; active?: boolean; glyph?: string }) {
  return (
    <div
      role="columnheader"
      onClick={onClick}
      className="label"
      style={{
        width,
        flexShrink: 0,
        padding: '0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        fontSize: 10,
        letterSpacing: '0.1em',
        color: active ? 'var(--color-text-amber)' : 'var(--color-text-muted)',
        cursor: onClick ? 'pointer' : 'default',
        position: sticky ? 'sticky' : undefined,
        left: sticky ? left : undefined,
        background: sticky ? 'var(--color-bg-elevated)' : undefined,
        zIndex: sticky ? 5 : undefined,
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {glyph}
    </div>
  );
}

function PinnedCell({ width, left, align, children }: { width: number; left: number; align: "left" | "right" | "center"; children: React.ReactNode }) {
  return (
    <div
      role="gridcell"
      style={{
        width,
        flexShrink: 0,
        padding: '0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        position: 'sticky',
        left,
        background: 'inherit',
        zIndex: 2,
      }}
    >
      {children}
    </div>
  );
}
