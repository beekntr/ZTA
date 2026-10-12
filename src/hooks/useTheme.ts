import { useMemo, useSyncExternalStore } from 'react';
import { getTheme, subscribeTheme } from '../services/theme';
import type { Theme } from '../services/theme';

export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, getTheme);
}

export interface ChartColors {
  series: string;
  grid: string;
  axis: string;
  text: string;
  surface: string;
}

// `_theme` only keys the memo: <html data-theme> already equals it when this runs.
function readChartColors(_theme: Theme): ChartColors {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  return {
    series: token('--chart-1'),
    grid: token('--chart-grid'),
    axis: token('--chart-axis'),
    text: token('--muted'),
    surface: token('--surface'),
  };
}

/** Recharts draws with SVG attributes, which don't resolve CSS variables
 *  reliably, so hand it the current theme's colors as plain values. */
export function useChartColors(): ChartColors {
  const theme = useTheme();
  return useMemo(() => readChartColors(theme), [theme]);
}
