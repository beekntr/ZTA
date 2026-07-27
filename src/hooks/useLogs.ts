import { useQuery } from '@tanstack/react-query';
import { getLogs, getBlockedLogs, getAttackers } from '../services/api';
import type { LogFilters } from '../types';

export function useLogs(filters: LogFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ['logs', filters],
    queryFn: ({ signal }) => getLogs(filters, signal),
    refetchInterval: 10_000,
    staleTime: 8_000,
    enabled,
  });
}

export function useBlockedLogs(limit = 50) {
  return useQuery({
    queryKey: ['logs-blocked', limit],
    queryFn: ({ signal }) => getBlockedLogs(limit, signal),
    refetchInterval: 10_000,
    staleTime: 8_000,
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
    queryFn: ({ signal }) => getLogs({ limit: 20, log_type: 'ZTA-INPUT-DROP' }, signal),
    refetchInterval: 5_000,
    staleTime: 4_000,
  });
}
