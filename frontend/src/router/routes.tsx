import {
  Navigate,
} from 'react-router-dom';

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
  TriggerExplorerPage,
} from '../features/triggers/pages/TriggerExplorerPage';

import {
  ProfilePage,
} from '../features/profile/pages/ProfilePage';

import {
  WelcomePage,
} from '../pages/WelcomePage';

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

const ONBOARDING_STORAGE_KEY =
  'synara-onboarding-completed';

function OnboardingGate() {
  const hasCompletedOnboarding =
    localStorage.getItem(
      ONBOARDING_STORAGE_KEY,
    ) === 'true';

  if (!hasCompletedOnboarding) {
    return (
      <Navigate
        to="/welcome"
        replace
      />
    );
  }

  return <AppLayout />;
}

export const routes = [
  {
    path: '/welcome',
    element: <WelcomePage />,
  },

  {
    element: <OnboardingGate />,

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
        path: '/triggers',
        element:
          <TriggerExplorerPage />,
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