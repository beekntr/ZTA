import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { Stats } from '../../types';

interface Props {
  data: Stats['daily_activity'];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1629]/95 border border-[#1e2a45] rounded-lg p-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-cyan-400">{payload[0].value.toLocaleString()} events</p>
      </div>
    );
  }
  return null;
};

export const DailyActivityChart: React.FC<Props> = ({ data }) => {
  const last7 = data.slice(-7).map((d) => ({
    date: (() => {
      try {
        return format(parseISO(d.date), 'MMM d');
      } catch {
        return d.date;
      }
    })(),
    count: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={last7} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={{ stroke: '#1e2a45' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e2a45', opacity: 0.5 }} />
        <Bar
          dataKey="count"
          fill="#00d4ff"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
          opacity={0.85}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
