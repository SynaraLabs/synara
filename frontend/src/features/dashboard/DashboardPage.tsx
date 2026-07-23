import { WelcomeCard } from './components/WelcomeCard';
import { QuickActions } from './components/QuickActions';
import { HealthSummary } from './components/HealthSummary';
import { RecentEpisodes } from './components/RecentEpisodes';


export function DashboardPage() {
  return (
    <div>

      <WelcomeCard />

      <QuickActions />

      <HealthSummary />

      <RecentEpisodes />

    </div>
  );
}