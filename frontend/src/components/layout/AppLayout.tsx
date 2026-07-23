import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import styles from './layout.module.css';


export function AppLayout() {
  return (
    <div className={styles.container}>

      <Sidebar />

      <div className={styles.content}>

        <Header />

        <main className={styles.main}>
          <Outlet />
        </main>

      </div>

    </div>
  );
}