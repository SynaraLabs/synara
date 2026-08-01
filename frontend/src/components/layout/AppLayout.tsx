import {
  Outlet,
} from 'react-router-dom';

import {
  useMigraineStore,
} from '../../features/migraine/store/migraine.store';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

import styles from './layout.module.css';

export function AppLayout() {
  const isCrisisActive =
    useMigraineStore(
      state =>
        state.activeEpisode
          ?.crisis.active === true,
    );

  return (
    <div
      className={`${styles.container} ${
        isCrisisActive
          ? styles.crisisMode
          : ''
      }`}
      data-crisis-active={
        isCrisisActive
          ? 'true'
          : undefined
      }
    >
      <Sidebar />

      <div className={styles.content}>
        <Header />

        <main
          className={styles.main}
          id="main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}