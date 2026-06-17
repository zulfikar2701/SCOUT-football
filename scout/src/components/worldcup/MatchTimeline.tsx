import { useState, useMemo } from 'react';
import type { FIFAMatch } from '../../lib/worldcup/types';
import { getMatchTimeline } from '../../lib/worldcup/api';
import { useQuery } from '@tanstack/react-query';

interface Props {
  match: FIFAMatch;
}

export function MatchTimeline({ match }: Props) {
  const [minute, setMinute] = useState(0);
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['wc-timeline', match.id],
    queryFn: () => getMatchTimeline(match.id),
  });

  const maxMinute = useMemo(() => {
    if (!entries.length) return 90;
    return Math.max(...entries.map((e) => e.time_minute), 90);
  }, [entries]);

  if (isLoading) {
    return <div className="mono" style={{ padding: 20, color: 'var(--color-text-muted)', fontSize: 12 }}>Loading timeline…</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Scrub bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
        <button
          className="mono"
          onClick={() => setMinute(Math.max(0, minute - 5))}
          style={scrubBtnStyle}
        >
          -5
        </button>
        <input
          type="range"
          min={0}
          max={maxMinute}
          value={minute}
          onChange={(e) => setMinute(Number(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--color-accent-amber)' }}
        />
        <button
          className="mono"
          onClick={() => setMinute(Math.min(maxMinute, minute + 5))}
          style={scrubBtnStyle}
        >
          +5
        </button>
        <span className="mono-bold" style={{ fontSize: 13, minWidth: 36, textAlign: 'center' }}>
          {minute}'
        </span>
      </div>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 320, overflowY: 'auto' }}>
        {entries.filter((e) => e.time_minute <= minute).map((e, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              background: e.is_home ? 'rgba(245,166,35,0.04)' : 'rgba(0,212,255,0.04)',
              borderLeft: `2px solid ${e.is_home ? 'var(--color-accent-amber)' : 'var(--color-accent-cyan)'}`,
              fontSize: 12,
            }}
          >
            <span className="mono-bold" style={{ minWidth: 32, color: 'var(--color-text-muted)' }}>
              {e.added_time ? `${e.time_minute}+${e.added_time}` : `${e.time_minute}'`}
            </span>
            <span style={{ flex: 1 }}>{e.description}</span>
            {e.home_score != null && e.away_score != null && (
              <span className="mono" style={{ color: 'var(--color-text-secondary)' }}>
                {e.home_score}–{e.away_score}
              </span>
            )}
          </div>
        ))}
        {entries.filter((e) => e.time_minute <= minute).length === 0 && (
          <div className="mono" style={{ padding: 12, color: 'var(--color-text-muted)', fontSize: 12 }}>
            No events up to minute {minute}
          </div>
        )}
      </div>
    </div>
  );
}

const scrubBtnStyle: React.CSSProperties = {
  fontSize: 11,
  padding: '6px 10px',
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border-mid)',
  color: 'var(--color-text-secondary)',
  minWidth: 36,
  minHeight: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
