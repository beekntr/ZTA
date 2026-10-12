import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarList } from '../ui/BarList';
import { useChartColors } from '../../hooks/useTheme';
import { formatNumber } from '../../lib/format';
import type { ThreatStats } from '../../types';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="text-muted">{label}</p>
      <p className="mt-0.5 font-medium tabular-nums text-fg">{formatNumber(payload[0].value)} attacks</p>
    </div>
  );
};

/** Attacks per hour: one series, a 2px line over a 10% wash, crosshair on hover. */
export const HourlyAttacksChart: React.FC<{ data: ThreatStats['hourly'] }> = ({ data }) => {
  const colors = useChartColors();
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={colors.grid} vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fill: colors.text, fontSize: 12 }}
          axisLine={{ stroke: colors.axis }}
          tickLine={false}
          interval={3}
          tickMargin={8}
        />
        <YAxis
          tick={{ fill: colors.text, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={36}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: colors.axis, strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke={colors.series}
          strokeWidth={2}
          fill={colors.series}
          fillOpacity={0.1}
          dot={false}
          activeDot={{ r: 4, fill: colors.series, stroke: colors.surface, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/** Share of attacks by protocol, ranked. */
export const ProtocolBreakdown: React.FC<{ data: ThreatStats['protocols'] }> = ({ data }) => {
  const total = data.reduce((sum, p) => sum + p.count, 0);
  const items = data.map((p) => ({
    key: p.protocol || 'other',
    label: (p.protocol || 'Other').toUpperCase(),
    value: p.count,
  }));
  return <BarList items={items} total={total} emptyText="No attacks in this period" />;
};
