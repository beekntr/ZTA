import { useQuery } from '@tanstack/react-query';
import { getStats } from '../services/api';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: ({ signal }) => getStats(signal),
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}
