import { createHashRouter } from 'react-router-dom';
import { AppShell } from './components/shell/AppShell';
import { Boot } from './pages/Boot';
import { Players } from './pages/Players';
import { PlayerProfile } from './pages/PlayerProfile';
import { Compare } from './pages/Compare';
import { Scatter } from './pages/Scatter';
import { SearchPage } from './pages/SearchPage';
import { NotFound } from './pages/NotFound';
import { WorldCupHome } from './pages/worldcup/WorldCupHome';
import { MatchesExplorer } from './pages/worldcup/MatchesExplorer';
import { MatchReplay } from './pages/worldcup/MatchReplay';
import { PlayersExplorer } from './pages/worldcup/PlayersExplorer';
import { PlayerProfile as WCPlayerProfile } from './pages/worldcup/PlayerProfile';

export const router = createHashRouter([
  { path: '/', element: <Boot /> },
  {
    element: <AppShell />,
    children: [
      { path: '/players', element: <Players /> },
      { path: '/players/:id', element: <PlayerProfile /> },
      { path: '/compare', element: <Compare /> },
      { path: '/scatter', element: <Scatter /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/worldcup', element: <WorldCupHome /> },
      { path: '/worldcup/matches', element: <MatchesExplorer /> },
      { path: '/worldcup/matches/:id', element: <MatchReplay /> },
      { path: '/worldcup/players', element: <PlayersExplorer /> },
      { path: '/worldcup/players/:id', element: <WCPlayerProfile /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
