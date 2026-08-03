import {
  AppLayout,
} from '../components/layout/AppLayout';

import {
  Dashboard,
} from '../pages/Dashboard';

import {
  MigrainePage,
} from '../features/migraine/pages/MigrainePage';

import {
  HistoryPage,
} from '../features/history/pages/HistoryPage';

import {
  HistoryEpisodeEditPage,
} from '../features/history/pages/HistoryEpisodeEditPage';

import {
  ProfilePage,
} from '../features/profile/pages/ProfilePage';

import {
  Anxiety,
} from '../pages/Anxiety';

import {
  Panic,
} from '../pages/Panic';

import {
  Journal,
} from '../pages/Journal';

import {
  Reports,
} from '../pages/Reports';

export const routes = [
  {
    element: <AppLayout />,

    children: [
      {
        path: '/',
        element: <Dashboard />,
      },

      {
        path: '/migraine',
        element: <MigrainePage />,
      },

      {
        path: '/history',
        element: <HistoryPage />,
      },

      {
        path:
          '/history/:episodeId/edit',
        element:
          <HistoryEpisodeEditPage />,
      },

      {
        path: '/profile',
        element: <ProfilePage />,
      },

      {
        path: '/anxiety',
        element: <Anxiety />,
      },

      {
        path: '/panic',
        element: <Panic />,
      },

      {
        path: '/journal',
        element: <Journal />,
      },

      {
        path: '/reports',
        element: <Reports />,
      },
    ],
  },
];