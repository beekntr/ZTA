import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import type { Stats } from '../../types';
import { useChartColors } from '../../hooks/useTheme';
import { formatCompact, formatNumber, formatTime } from '../../lib/format';

interface Props {
  data: Stats['daily_activity'];
}

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as { full: string; count: number };
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="text-muted">{point.full}</p>
      <p className="mt-0.5 font-medium tabular-nums text-fg">{formatNumber(point.count)} events</p>
    </div>
  );
};

/** One series (events per day), so one color and no legend. */
export const DailyActivityChart: React.FC<Props> = ({ data }) => {
  const colors = useChartColors();
  const days = data.slice(-7).map((d) => ({
    day: formatTime(d.date, 'EEE d'),
    full: formatTime(d.date, 'EEEE, d MMMM'),
    count: d.count,
  }));

  if (days.length === 0) return <p className="py-16 text-center text-sm text-muted">No activity yet</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={days} margin={{ top: 20, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={colors.grid} vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: colors.text, fontSize: 12 }}
          axisLine={{ stroke: colors.axis }}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          tick={{ fill: colors.text, fontSize: 12 }}
          tickFormatter={(v: number) => formatCompact(v)}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: colors.grid }} />
        <Bar dataKey="count" fill={colors.series} radius={[4, 4, 0, 0]} maxBarSize={24}>
          <LabelList
            dataKey="count"
            position="top"
            offset={6}
            fill={colors.text}
            fontSize={11}
            formatter={(v) => formatCompact(Number(v))}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
