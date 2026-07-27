import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRules, addRule, deleteRule, blockIp } from '../services/api';
import type { RuleCreate } from '../types';

export function useRules() {
  return useQuery({
    queryKey: ['rules'],
    queryFn: ({ signal }) => getRules(signal),
    staleTime: 30_000,
  });
}

export function useAddRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rule: RuleCreate) => addRule(rule),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rules'] }),
  });
}

export function useDeleteRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: number) => deleteRule(ruleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rules'] }),
  });
}

export function useBlockIp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ip: string) => blockIp(ip),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rules'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
