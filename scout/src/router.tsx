import { createHashRouter } from 'react-router-dom';
import { AppShell } from './components/shell/AppShell';
import { Boot } from './pages/Boot';
import { Players } from './pages/Players';
import { PlayerProfile } from './pages/PlayerProfile';
import { Compare } from './pages/Compare';
import { Scatter } from './pages/Scatter';
import { SearchPage } from './pages/SearchPage';
import { NotFound } from './pages/NotFound';

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
      { path: '*', element: <NotFound /> },
    ],
  },
]);
