import React from 'react';
import { useAttackers } from '../hooks/useLogs';
import { useThreatStats } from '../hooks/useStats';
import { AttackerLeaderboard } from '../components/threats/AttackerLeaderboard';
import { HourlyAttacksChart, ProtocolBreakdown } from '../components/threats/AttackPatternChart';
import { LiveAttackFeed } from '../components/threats/LiveAttackFeed';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { formatNumber } from '../lib/format';

export const Threats: React.FC = () => {
  const { data: attackersRaw, isLoading: attackersLoading } = useAttackers(10);
  const { data: threatStats, isLoading: threatsLoading } = useThreatStats(24);
  const attackers = Array.isArray(attackersRaw) ? attackersRaw : [];

  const hourly = threatStats?.hourly ?? [];
  const total = hourly.reduce((sum, h) => sum + h.count, 0);
  const peak = hourly.reduce((best, h) => (h.count > best.count ? h : best), { hour: '', count: 0 });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Two independent columns, so a short card never stretches to match a tall one */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardHeader
              title="Attacks per hour"
              subtitle={
                threatsLoading
                  ? 'Internet sources, last 24 hours'
                  : `${formatNumber(total)} in the last 24 hours${peak.count ? ` · peak ${formatNumber(peak.count)} at ${peak.hour}` : ''}`
              }
            />
            {threatsLoading ? <Skeleton className="h-[240px]" /> : <HourlyAttacksChart data={hourly} />}
          </Card>
          <Card>
            <CardHeader title="Top attackers" subtitle="Internet sources dropped in the last 7 days" />
            <AttackerLeaderboard attackers={attackers} loading={attackersLoading} />
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="By protocol" subtitle="Share of attacks, last 24 hours" />
            {threatsLoading ? <Skeleton className="h-24" /> : <ProtocolBreakdown data={threatStats?.protocols ?? []} />}
          </Card>
          <Card>
            <CardHeader
              title="Live feed"
              subtitle="Newest input drops, refreshed every 5 seconds"
              action={
                <span className="flex items-center gap-1.5 text-xs font-medium text-fg-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-good-mark" aria-hidden="true" />
                  Live
                </span>
              }
            />
            <LiveAttackFeed />
          </Card>
        </div>
      </div>
    </div>
  );
};
