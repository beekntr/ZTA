import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Stats } from '../../types';

const LOG_COLORS: Record<string, string> = {
  'ZTA-INPUT-DROP': '#ff3366',
  'ZTA-FORWARD-DROP': '#ff8800',
  'ZTA-BLOCKED-U2T': '#cc1133',
  'ZTA-BLOCKED-T2U': '#ff4488',
  'ZTA-SSH-ALLOW': '#00ff88',
  'ZTA-ALLOW-D2T': '#00d4ff',
  'ZTA-ALLOW-D2U': '#00aacc',
};

const DEFAULT_COLORS = ['#00d4ff', '#ff3366', '#00ff88', '#ffaa00', '#8b5cf6', '#ec4899', '#14b8a6'];

interface Props {
  data: Stats['by_type'];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1629]/95 border border-[#1e2a45] rounded-lg p-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-1">{payload[0].name}</p>
        <p className="text-sm font-bold text-slate-200">{payload[0].value.toLocaleString()} events</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-col gap-1.5 mt-2">
    {payload?.map((entry: any, i: number) => (
      <div key={i} className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: entry.color }} />
        <span className="text-xs text-slate-400 truncate">{entry.value}</span>
      </div>
    ))}
  </div>
);

export const LogTypePieChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map((d) => ({ name: d.log_type, value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="45%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {chartData.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={LOG_COLORS[entry.name] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          content={<CustomLegend />}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
