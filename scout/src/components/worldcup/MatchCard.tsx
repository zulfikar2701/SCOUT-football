import type { FIFAMatch } from '../../lib/worldcup/types';
import { formatMatchTime, teamName, matchScoreLine, matchStatusLabel, matchStatusColor } from '../../lib/worldcup/api';
import { TeamBadge } from './TeamBadge';
import { Link } from 'react-router-dom';

interface Props {
  match: FIFAMatch;
}

export function MatchCard({ match }: Props) {
  const statusColor = matchStatusColor(match.status);
  const isLive = match.status === 'in_progress';

  return (
    <Link
      to={`/worldcup/matches/${match.id}`}
      style={{
        display: 'block',
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-mid)',
        padding: '12px 14px',
        textDecoration: 'none',
        color: 'inherit',
        minHeight: 88,
        touchAction: 'manipulation',
      }}
      className="panel-hover"
    >
      {/* Meta row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="label" style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
          {match.stage?.name ?? 'Match'} {match.group ? `· ${match.group.name}` : ''}
        </span>
        <span
          className="mono-bold"
          style={{
            fontSize: 10,
            color: statusColor,
            letterSpacing: '0.08em',
            animation: isLive ? 'pulse 1.2s infinite' : undefined,
          }}
        >
          {matchStatusLabel(match.status)}
        </span>
      </div>

      {/* Teams row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <TeamBadge team={match.home_team} size="sm" />
          <span className="mono" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {teamName(match, 'home')}
          </span>
        </div>

        <div className="mono-bold" style={{ fontSize: 18, color: 'var(--color-text-primary)', flexShrink: 0, minWidth: 44, textAlign: 'center' }}>
          {matchScoreLine(match)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
          <span className="mono" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
            {teamName(match, 'away')}
          </span>
          <TeamBadge team={match.away_team} size="sm" />
        </div>
      </div>

      {/* Time row */}
      <div style={{ marginTop: 8, fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center' }} className="mono">
        {formatMatchTime(match.datetime)}
        {match.stadium ? ` · ${match.stadium.name}` : ''}
      </div>
    </Link>
  );
}
