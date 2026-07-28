import { WelcomeCard } from './components/WelcomeCard';
import { QuickActions } from './components/QuickActions';
import { HealthSummary } from './components/HealthSummary';
import { RealRecentEpisodes } from './components/RealRecentEpisodes';
import { InsightsSummary } from './components/InsightsSummary';

import styles from './dashboard.module.css';

export function DashboardPage() {
  return (
    <section className={styles.dashboard}>
      <WelcomeCard />

      <QuickActions />

      <HealthSummary />

      <InsightsSummary />

      <RealRecentEpisodes />
    </section>
  );
}