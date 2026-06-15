import { Link } from 'react-router-dom';
import type { Player } from '../../lib/types';
import { RatingRing } from './RatingRing';
import { PositionBadge } from '../primitives/PositionBadge';
import { LeagueFlag } from '../primitives/LeagueFlag';
import { DiamondRating } from '../primitives/DiamondRating';
import { KEY_TO_LEAGUE, SEASON_LABEL } from '../../lib/constants';
import { ChevronRight } from '../primitives/Icons';

export function PlayerHeader({ player, ratingPct }: { player: Player; ratingPct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 22px', borderBottom: '1px solid var(--color-border-mid)', background: 'var(--color-bg-surface)' }}>
      <RatingRing rating={player.rating ?? 0} percentile={ratingPct} />
      <div style={{ flex: 1 }}>
        <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 6 }}>
          <Link to="/players" style={{ color: 'var(--color-text-muted)' }}>PLAYERS</Link>
          <ChevronRight size={8} />
          <span style={{ color: 'var(--color-text-secondary)' }}>{player.name.toUpperCase()}</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--color-text-primary)' }}>{player.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          <PositionBadge pos={player.posGroup} large />
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <LeagueFlag league={player.leagueKey} /> {player.team}
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{KEY_TO_LEAGUE[player.leagueKey].name} · {SEASON_LABEL}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <Meta label="Age" value={player.age != null ? String(player.age) : '–'} />
        <Meta label="Foot" value={player.foot ?? '–'} />
        <Meta label="Nation" value={player.nat ?? '–'} />
        <Meta label="Apps" value={String(player.matches)} />
        <Meta label="Mins" value={player.minutes.toLocaleString('en-GB')} />
        <div style={{ textAlign: 'center' }}>
          <div className="label" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 4 }}>Quality</div>
          <DiamondRating value={player.rating ?? 0} />
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 40 }}>
      <div className="label" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 3 }}>{label}</div>
      <div className="mono-bold" style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{value}</div>
    </div>
  );
}
