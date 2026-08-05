import {
  HealthSummary,
} from './components/HealthSummary';

import {
  InsightsSummary,
} from './components/InsightsSummary';

import {
  MigrainePatternsSummary,
} from './components/MigrainePatternsSummary';

import {
  QuickActions,
} from './components/QuickActions';

import {
  RealRecentEpisodes,
} from './components/RealRecentEpisodes';

import {
  WelcomeCard,
} from './components/WelcomeCard';

import styles from './dashboard.module.css';

export function DashboardPage() {
  return (
    <section
      className={
        styles.dashboard
      }
    >
      <div
        className={
          styles.introduction
        }
      >
        <HealthSummary />

        <WelcomeCard />

        <QuickActions />
      </div>

      <div
        className={
          styles.dashboardContent
        }
      >
        <InsightsSummary />

        <MigrainePatternsSummary />

        <RealRecentEpisodes />
      </div>
    </section>
  );
}