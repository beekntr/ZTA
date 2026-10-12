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

  const days = stats?.window_days ?? 7;
  // Every log type that means a packet was stopped (drops and zone blocks)
  const byType = Array.isArray(stats?.by_type) ? stats.by_type : [];
  const blocked = byType
    .filter((b) => b.log_type.includes('BLOCK') || b.log_type.includes('DROP'))
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
          trendValue={`Last ${days} days`}
          loading={isLoading}
        />
        <StatsCard
          title="Unique Attackers"
          value={stats?.unique_attackers ?? 0}
          icon={<ShieldAlert className="w-5 h-5" />}
          color="red"
          trendValue={`Internet IPs, last ${days} days`}
          loading={isLoading}
        />
        <StatsCard
          title="Blocked Packets"
          value={blocked}
          icon={<ShieldOff className="w-5 h-5" />}
          color="amber"
          trendValue={`Drops + zone blocks, ${days} days`}
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
            subtitle={`Traffic classification by ZTA policy — last ${days} days`}
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
            subtitle="Internet sources ranked by attempts — last 7 days"
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
