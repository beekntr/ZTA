import React from 'react';
import { BarList } from '../ui/BarList';
import type { Stats } from '../../types';

interface Props {
  data: Stats['by_type'];
}

/** Events per log type, ranked. Bars instead of a donut: the counts differ by
 *  orders of magnitude, so slices would hide everything but the top two. */
export const LogTypeBreakdown: React.FC<Props> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const items = [...data]
    .sort((a, b) => b.count - a.count)
    .map((d) => ({
      key: d.log_type,
      label: <span className="font-mono text-xs">{d.log_type.replace(/^ZTA-/, '')}</span>,
      value: d.count,
    }));
  return <BarList items={items} total={total} emptyText="No events in this period" />;
};
