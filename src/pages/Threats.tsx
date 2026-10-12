import React from 'react';
import { Crosshair, Trophy, Activity, Globe } from 'lucide-react';
import { useAttackers } from '../hooks/useLogs';
import { useThreatStats } from '../hooks/useStats';
import { AttackerLeaderboard } from '../components/threats/AttackerLeaderboard';
import { AttackPatternChart } from '../components/threats/AttackPatternChart';
import { LiveAttackFeed } from '../components/threats/LiveAttackFeed';
import { Card, CardHeader } from '../components/ui/Card';
import { format, parseISO } from 'date-fns';

export const Threats: React.FC = () => {
  const { data: attackersRaw, isLoading: attackersLoading } = useAttackers(20);
  const { data: threatStats, isLoading: threatsLoading } = useThreatStats(24);

  const attackers = Array.isArray(attackersRaw) ? attackersRaw : [];

  // Build geo table from attacker data (top 10)
  const geoTableData = attackers.slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top row: Leaderboard + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Attacker Leaderboard"
            subtitle="Internet sources dropped in the last 7 days"
            icon={<Trophy className="w-4 h-4" />}
          />
          <AttackerLeaderboard attackers={attackers} loading={attackersLoading} />
        </Card>

        <Card>
          <CardHeader
            title="Live Attack Feed"
            subtitle="ZTA-INPUT-DROP events — newest first"
            icon={<Crosshair className="w-4 h-4" />}
          />
          <LiveAttackFeed />
        </Card>
      </div>

      {/* Attack patterns */}
      <Card>
        <CardHeader
          title="Attack Pattern Analysis"
          subtitle="Internet attacks per hour and by protocol (own devices excluded)"
          icon={<Activity className="w-4 h-4" />}
        />
        <AttackPatternChart data={threatStats} loading={threatsLoading} />
      </Card>

      {/* Geographic table */}
      <Card>
        <CardHeader
          title="Geographic Overview"
          subtitle="IP origin intelligence (top 10 attackers)"
          icon={<Globe className="w-4 h-4" />}
        />
        <div className="overflow-x-auto rounded-lg border border-[#1e2a45]">
          <table className="w-full text-xs">
            <thead className="bg-[#1e2a45]/40">
              <tr>
                {['Rank', 'IP Address', 'Attempts', 'Last Seen'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 font-medium text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a45]/40">
              {geoTableData.map((a, i) => (
                <tr key={a.src_ip} className="hover:bg-[#1e2a45]/20 transition-colors">
                  <td className="px-3 py-2.5 text-slate-600 font-mono">#{i + 1}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-200">{a.src_ip}</td>
                  <td className="px-3 py-2.5 text-red-400 font-bold font-mono">
                    {a.attempts.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {(() => {
                      try {
                        return format(parseISO(a.last_attempt), 'yyyy-MM-dd HH:mm');
                      } catch {
                        return a.last_attempt;
                      }
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
