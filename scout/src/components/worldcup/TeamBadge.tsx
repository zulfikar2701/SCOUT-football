import type { FIFATeam } from '../../lib/worldcup/types';

interface Props {
  team?: FIFATeam | null;
  abbr?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { font: 10, pad: '2px 6px', minW: 28 },
  md: { font: 13, pad: '4px 10px', minW: 40 },
  lg: { font: 18, pad: '6px 14px', minW: 56 },
};

export function TeamBadge({ team, abbr, size = 'md' }: Props) {
  const text = abbr ?? team?.abbreviation ?? team?.country_code ?? 'TBD';
  const s = sizeMap[size];
  return (
    <span
      className="mono-bold"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: s.font,
        padding: s.pad,
        minWidth: s.minW,
        minHeight: s.minW,
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-mid)',
        color: 'var(--color-text-primary)',
        letterSpacing: '0.05em',
        lineHeight: 1,
      }}
    >
      {text}
    </span>
  );
}
