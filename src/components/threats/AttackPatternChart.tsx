import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { ThreatStats } from '../../types';

interface Props {
  data?: ThreatStats;
  loading?: boolean;
}

const PROTO_COLORS: Record<string, string> = {
  tcp: '#00d4ff',
  udp: '#ffaa00',
  icmp: '#ff3366',
  other: '#8b5cf6',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card/95 border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-red-400">{payload[0].value} attacks</p>
      </div>
    );
  }
  return null;
};

export const AttackPatternChart: React.FC<Props> = ({ data, loading }) => {
  // Hourly buckets come zero-filled from the server, in server time.
  const hourlyData = data?.hourly ?? [];

  const protoData = useMemo(
    () => (data?.protocols ?? []).map((p) => ({ name: (p.protocol || 'other').toUpperCase(), value: p.count })),
    [data],
  );

  if (loading) {
    return <div className="h-72 bg-border/30 rounded-lg animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      {/* Hourly line chart */}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
          Attacks Per Hour (Last {data?.hours ?? 24}h)
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={hourlyData} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={5}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#ff3366"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#ff3366' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Protocol donut */}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
          Protocol Distribution
        </p>
        {protoData.length === 0 ? (
          <p className="text-sm text-slate-600">No attacks in this period</p>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={protoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {protoData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PROTO_COLORS[entry.name.toLowerCase()] ?? PROTO_COLORS.other}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5">
              {protoData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{
                      background: PROTO_COLORS[entry.name.toLowerCase()] ?? PROTO_COLORS.other,
                    }}
                  />
                  <span className="text-slate-400 font-mono">{entry.name}</span>
                  <span className="text-slate-600">{entry.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
