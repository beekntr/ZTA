import { useQuery } from '@tanstack/react-query';
import { getLogs, getAttackers } from '../services/api';
import type { LogFilters } from '../types';

export function useLogs(filters: LogFilters = {}, refetchInterval: number | false = 10_000) {
  return useQuery({
    queryKey: ['logs', filters],
    queryFn: ({ signal }) => getLogs(filters, signal),
    refetchInterval,
    staleTime: 4_000,
  });
}

export function useAttackers(limit = 10) {
  return useQuery({
    queryKey: ['attackers', limit],
    queryFn: ({ signal }) => getAttackers(limit, signal),
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

export function useLiveFeed() {
  return useQuery({
    queryKey: ['live-feed'],
    // Internet attacks only: own containers and gateway would drown them out.
    queryFn: ({ signal }) =>
      getLogs({ limit: 20, log_type: 'ZTA-INPUT-DROP', exclude_internal: true }, signal),
    refetchInterval: 5_000,
    staleTime: 4_000,
  });
}
