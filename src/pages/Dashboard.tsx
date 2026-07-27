import React from 'react';
import { Activity, ShieldAlert, ShieldOff, ListChecks } from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { useAttackers } from '../hooks/useLogs';
import { StatsCard } from '../components/dashboard/StatsCard';
import { LogTypePieChart } from '../components/dashboard/LogTypePieChart';
import { DailyActivityChart } from '../components/dashboard/DailyActivityChart';
import { TopAttackersTable } from '../components/dashboard/TopAttackersTable';
import { RecentLogsWidget } from '../components/dashboard/RecentLogsWidget';
import { Card, CardHeader } from '../components/ui/Card';
import { PieChart, BarChart2, Users, Rss } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useStats();
  const { data: attackersRaw, isLoading: attackersLoading } = useAttackers(10);
  const attackers = Array.isArray(attackersRaw) ? attackersRaw : [];

  const getCount = (logType: string) =>
    stats?.by_type.find((b) => b.log_type === logType)?.count ?? 0;

  const inputDrops = getCount('ZTA-INPUT-DROP');
  // Sum all log types that indicate a blocked connection
  const byType = Array.isArray(stats?.by_type) ? stats.by_type : [];
  const blocked = byType
    .filter((b) => b.log_type.includes('BLOCK'))
    .reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Events"
          value={stats?.total_logs ?? 0}
          icon={<Activity className="w-5 h-5" />}
          color="cyan"
          trend="up"
          trendValue="All time"
          loading={isLoading}
        />
        <StatsCard
          title="Active Threats"
          value={inputDrops}
          icon={<ShieldAlert className="w-5 h-5" />}
          color="red"
          trend="up"
          trendValue="INPUT drops"
          loading={isLoading}
        />
        <StatsCard
          title="Blocked Connections"
          value={blocked}
          icon={<ShieldOff className="w-5 h-5" />}
          color="amber"
          trend="neutral"
          trendValue="U2T + T2U"
          loading={isLoading}
        />
        <StatsCard
          title="Active Rules"
          value={stats?.active_rules ?? 0}
          icon={<ListChecks className="w-5 h-5" />}
          color="emerald"
          trendValue={`${stats?.total_devices ?? 0} devices`}
          loading={isLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="Log Type Breakdown"
            subtitle="Traffic classification by ZTA policy"
            icon={<PieChart className="w-4 h-4" />}
          />
          {isLoading ? (
            <div className="h-60 bg-border/30 rounded-lg animate-pulse" />
          ) : (
            <LogTypePieChart data={stats?.by_type ?? []} />
          )}
        </Card>

        <Card>
          <CardHeader
            title="Daily Activity"
            subtitle="Network events — last 7 days"
            icon={<BarChart2 className="w-4 h-4" />}
          />
          {isLoading ? (
            <div className="h-60 bg-border/30 rounded-lg animate-pulse" />
          ) : (
            <DailyActivityChart data={stats?.daily_activity ?? []} />
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="Top Attackers"
            subtitle="Ranked by attempt count"
            icon={<Users className="w-4 h-4" />}
          />
          <TopAttackersTable data={attackers} loading={attackersLoading} />
        </Card>

        <Card>
          <CardHeader
            title="Recent Logs"
            subtitle="Last 10 network events"
            icon={<Rss className="w-4 h-4" />}
          />
          <RecentLogsWidget />
        </Card>
      </div>
    </div>
  );
};
