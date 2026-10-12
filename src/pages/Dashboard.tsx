import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Crosshair, ShieldX, ListChecks } from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { useAttackers } from '../hooks/useLogs';
import { StatsCard } from '../components/dashboard/StatsCard';
import { LogTypeBreakdown } from '../components/dashboard/LogTypeBreakdown';
import { DailyActivityChart } from '../components/dashboard/DailyActivityChart';
import { TopAttackersTable } from '../components/dashboard/TopAttackersTable';
import { RecentLogsWidget } from '../components/dashboard/RecentLogsWidget';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useStats();
  const { data: attackersRaw, isLoading: attackersLoading } = useAttackers(8);
  const attackers = Array.isArray(attackersRaw) ? attackersRaw : [];

  const days = stats?.window_days ?? 7;
  // Every log type that means a packet was stopped (drops and zone blocks)
  const byType = Array.isArray(stats?.by_type) ? stats.by_type : [];
  const blocked = byType
    .filter((b) => b.log_type.includes('BLOCK') || b.log_type.includes('DROP'))
    .reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatsCard label="Events" value={stats?.total_logs ?? 0} hint={`Logged in the last ${days} days`} icon={<Activity />} loading={isLoading} />
        <StatsCard label="Unique attackers" value={stats?.unique_attackers ?? 0} hint="Internet IPs that were dropped" icon={<Crosshair />} loading={isLoading} />
        <StatsCard label="Blocked packets" value={blocked} hint="Drops and zone blocks" icon={<ShieldX />} loading={isLoading} />
        <StatsCard label="Active rules" value={stats?.active_rules ?? 0} hint={`${stats?.total_devices ?? 0} devices registered`} icon={<ListChecks />} loading={isLoading} />
      </div>

      {/* Two independent columns, so a short card never stretches to match a tall one */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader title="Daily activity" subtitle="Logged events per day" />
            {isLoading ? <Skeleton className="h-[260px]" /> : <DailyActivityChart data={stats?.daily_activity ?? []} />}
          </Card>
          <Card>
            <CardHeader
              title="Top attackers"
              subtitle="Internet sources, last 7 days"
              action={
                <Link to="/threats" className="text-xs font-medium text-accent-text hover:underline">
                  View all
                </Link>
              }
            />
            <TopAttackersTable data={attackers} loading={attackersLoading} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Traffic by log type" subtitle={`Share of all events, last ${days} days`} />
            {isLoading ? <Skeleton className="h-40" /> : <LogTypeBreakdown data={byType} />}
          </Card>
          <Card>
            <CardHeader
              title="Recent events"
              subtitle="Refreshes every 10 seconds"
              action={
                <Link to="/logs" className="text-xs font-medium text-accent-text hover:underline">
                  Open logs
                </Link>
              }
            />
            <RecentLogsWidget />
          </Card>
        </div>
      </div>
    </div>
  );
};
