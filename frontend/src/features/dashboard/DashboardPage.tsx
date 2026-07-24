import { WelcomeCard } from './components/WelcomeCard';
import { QuickActions } from './components/QuickActions';
import { HealthSummary } from './components/HealthSummary';
import { RealRecentEpisodes } from './components/RealRecentEpisodes';
import { InsightsSummary } from './components/InsightsSummary';



export function DashboardPage() {


  return (

    <div>


      <WelcomeCard />


      <QuickActions />


      <HealthSummary />


      <InsightsSummary />


      <RealRecentEpisodes />


    </div>

  );

}