import { useParams } from 'react-router-dom';
import { getPlayerProfile } from '../../lib/worldcup/api';
import { loadWCTeams } from '../../lib/worldcup/data';
import { useQuery } from '@tanstack/react-query';

export function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const playerId = Number(id);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['wc-player-profile', playerId],
    queryFn: () => getPlayerProfile(playerId),
  });

  const { data: teams = [] } = useQuery({ queryKey: ['wc-teams'], queryFn: () => loadWCTeams() });

  const team = profile ? teams.find((t) => t.id === profile.team_id) : undefined;

  if (isLoading) {
    return <div className="mono" style={{ padding: 20, color: 'var(--color-text-muted)', fontSize: 12 }}>Loading profile…</div>;
  }

  if (!profile) {
    return <div className="mono" style={{ padding: 20, color: 'var(--color-accent-red)', fontSize: 12 }}>Player not found</div>;
  }

  const statGrid = [
    { label: 'Appearances', value: profile.appearances },
    { label: 'Starts', value: profile.starts },
    { label: 'Minutes', value: profile.minutes_played },
    { label: 'Goals', value: profile.goals },
    { label: 'Assists', value: profile.assists },
    { label: 'xG', value: profile.expected_goals.toFixed(2) },
    { label: 'xA', value: profile.expected_assists.toFixed(2) },
    { label: 'Key Passes', value: profile.key_passes },
    { label: 'Shots on Target', value: profile.shots_on_target },
    { label: 'Tackles', value: profile.tackles },
    { label: 'Interceptions', value: profile.interceptions },
    { label: 'Clearances', value: profile.clearances },
    { label: 'Duels Won', value: profile.duels_won },
    { label: 'Saves', value: profile.saves },
    { label: 'Avg Rating', value: profile.avg_rating?.toFixed(1) ?? '–' },
    { label: 'Cards', value: `${profile.yellow_cards}Y ${profile.red_cards}R` },
  ];

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header card */}
      <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-mid)', padding: '16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div
            className="mono-bold"
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-hi)',
              fontSize: 20,
              color: 'var(--wc-accent-gold)',
            }}
          >
            {profile.player.jersey_number ?? '–'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{profile.player.name}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {team?.name ?? '–'} · {profile.player.position ?? '–'}
              {profile.age != null ? ` · Age ${profile.age}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
        {statGrid.map((s) => (
          <div
            key={s.label}
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-mid)',
              padding: '10px 8px',
              textAlign: 'center',
            }}
          >
            <div className="label" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div className="mono-bold" style={{ fontSize: 16, color: 'var(--color-text-primary)' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
