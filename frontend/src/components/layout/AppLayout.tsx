import {
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  useMigraineStore,
} from '../../features/migraine/store/migraine.store';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

import styles from './layout.module.css';

export function AppLayout() {
  const location =
    useLocation();

  const isCrisisActive =
    useMigraineStore(
      state =>
        state.activeEpisode
          ?.crisis.active === true,
    );

  const isMigraineRoute =
    location.pathname ===
      '/migraine' ||
    location.pathname.startsWith(
      '/migraine/',
    );

  const showCrisisMode =
    isCrisisActive &&
    isMigraineRoute;

  return (
    <div
      className={`${styles.container} ${
        showCrisisMode
          ? styles.crisisMode
          : ''
      }`}
      data-crisis-active={
        showCrisisMode
          ? 'true'
          : undefined
      }
    >
      <Sidebar />

      <div
        className={
          styles.content
        }
      >
        <Header />

        <main
          className={
            styles.main
          }
          id="main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}