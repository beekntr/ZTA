import { useQuery } from '@tanstack/react-query';
import { getStats, getThreatStats } from '../services/api';

export function useStats(days = 7) {
  return useQuery({
    queryKey: ['stats', days],
    queryFn: ({ signal }) => getStats(days, signal),
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}

export function useThreatStats(hours = 24) {
  return useQuery({
    queryKey: ['threat-stats', hours],
    queryFn: ({ signal }) => getThreatStats(hours, signal),
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}
