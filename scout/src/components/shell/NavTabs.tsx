import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/players', label: 'Players' },
  { to: '/compare', label: 'Compare' },
  { to: '/scatter', label: 'Scatter' },
  { to: '/search', label: 'Search' },
];

export function NavTabs() {
  return (
    <nav style={{ display: 'flex', gap: 4, height: '100%' }}>
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className="label"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            height: '100%',
            fontSize: 12,
            letterSpacing: '0.08em',
            color: isActive ? 'var(--color-text-amber)' : 'var(--color-text-secondary)',
            borderBottom: isActive ? '2px solid var(--color-accent-amber)' : '2px solid transparent',
            transition: 'color 120ms',
          })}
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
