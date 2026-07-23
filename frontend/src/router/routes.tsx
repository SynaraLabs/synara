import { AppLayout } from '../components/layout/AppLayout';

import { Dashboard } from '../pages/Dashboard';
import { MigrainePage } from '../features/migraine/pages/MigrainePage';
import { Anxiety } from '../pages/Anxiety';
import { Panic } from '../pages/Panic';
import { Journal } from '../pages/Journal';
import { Reports } from '../pages/Reports';


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