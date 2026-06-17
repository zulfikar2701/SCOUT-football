import { useParams } from 'react-router-dom';
import { getMatch } from '../../lib/worldcup/api';
import { useQuery } from '@tanstack/react-query';
import { MatchTimeline } from '../../components/worldcup/MatchTimeline';
import { MomentumChart } from '../../components/worldcup/MomentumChart';
import { MatchPlayerStatsTable } from '../../components/worldcup/MatchPlayerStatsTable';

export function MatchReplay() {
  const { id } = useParams<{ id: string }>();
  const matchId = Number(id);

  const { data: match, isLoading } = useQuery({
    queryKey: ['wc-match', matchId],
    queryFn: () => getMatch(matchId),
  });

  if (isLoading) {
    return <div className="mono" style={{ padding: 20, color: 'var(--color-text-muted)', fontSize: 12 }}>Loading match…</div>;
  }

  if (!match) {
    return <div className="mono" style={{ padding: 20, color: 'var(--color-accent-red)', fontSize: 12 }}>Match not found</div>;
  }

  const homeName = match.home_team?.name ?? match.home_team_source?.description ?? 'TBD';
  const awayName = match.away_team?.name ?? match.away_team_source?.description ?? 'TBD';
  const homeAbbr = match.home_team?.abbreviation ?? match.home_team?.country_code ?? 'TBD';
  const awayAbbr = match.away_team?.abbreviation ?? match.away_team?.country_code ?? 'TBD';
  const homeScore = match.home_score ?? 0;
  const awayScore = match.away_score ?? 0;

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Scoreboard */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-mid)',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}>
            <span className="mono-bold" style={{ fontSize: 14 }}>{homeAbbr}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{homeName}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
            <span className="mono-bold" style={{ fontSize: 'clamp(24px, 8vw, 40px)', color: 'var(--color-text-primary)' }}>
              {match.status === 'scheduled' ? 'v' : `${homeScore}–${awayScore}`}
            </span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
              {match.status === 'completed' ? 'FT' : match.status === 'in_progress' ? 'LIVE' : match.status.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}>
            <span className="mono-bold" style={{ fontSize: 14 }}>{awayAbbr}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{awayName}</span>
          </div>
        </div>

        <div className="mono" style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          {new Date(match.datetime).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          {match.stadium ? ` · ${match.stadium.name}, ${match.stadium.city ?? ''}` : ''}
        </div>

        {match.clock_display && (
          <div className="mono-bold" style={{ fontSize: 14, color: 'var(--color-accent-green)', textAlign: 'center' }}>
            {match.clock_display}
          </div>
        )}
      </div>

      {/* Momentum */}
      <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-mid)', padding: '10px 12px' }}>
        <MomentumChart match={match} />
      </div>

      {/* Timeline */}
      <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-mid)', padding: '10px 12px' }}>
        <MatchTimeline match={match} />
      </div>

      {/* Player stats */}
      <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-mid)', padding: '10px 12px' }}>
        <div className="label" style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 8 }}>PLAYER STATS</div>
        <MatchPlayerStatsTable match={match} />
      </div>
    </div>
  );
}
