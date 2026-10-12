import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2, ShieldCheck, ShieldX } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useDeleteRule } from '../../hooks/useRules';
import { errorMessage } from '../../services/api';
import type { FirewallRule } from '../../types';

interface Props {
  rules: FirewallRule[];
  loading?: boolean;
}

export const RulesTable: React.FC<Props> = ({ rules, loading }) => {
  const { mutateAsync: deleteRule } = useDeleteRule();
  const { success, error } = useToast();
  const [deleting, setDeleting] = useState<Set<number>>(new Set());

  const handleDelete = async (id: number) => {
    setDeleting((s) => new Set([...s, id]));
    try {
      await deleteRule(id);
      success('Rule Deactivated', `Rule #${id} was removed from the firewall`);
    } catch (err) {
      error('Delete Failed', errorMessage(err));
    } finally {
      setDeleting((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-[#1e2a45]/60 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#1e2a45]">
      <table className="w-full text-xs">
        <thead className="bg-[#1e2a45]/40">
          <tr>
            {['ID', 'Name', 'Src IP', 'Dst IP', 'Proto', 'Port', 'Action', 'Direction', 'Created', 'Status', ''].map(
              (h) => (
                <th key={h} className="text-left px-3 py-2.5 font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2a45]/40">
          {rules.map((rule) => (
            <tr key={rule.id} className="hover:bg-[#1e2a45]/20 transition-colors">
              <td className="px-3 py-2.5 font-mono text-slate-600">{rule.id}</td>
              <td className="px-3 py-2.5 text-slate-200 max-w-32 truncate">{rule.rule_name}</td>
              <td className="px-3 py-2.5 font-mono text-slate-400">{rule.src_ip ?? '—'}</td>
              <td className="px-3 py-2.5 font-mono text-slate-400">{rule.dst_ip ?? '—'}</td>
              <td className="px-3 py-2.5 text-slate-500 uppercase">{rule.protocol}</td>
              <td className="px-3 py-2.5 text-slate-500">{rule.dst_port ?? '—'}</td>
              <td className="px-3 py-2.5">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    rule.action.toLowerCase() === 'block' || rule.action.toLowerCase() === 'drop'
                      ? 'bg-red-900/40 text-red-400'
                      : 'bg-emerald-900/40 text-emerald-400'
                  }`}
                >
                  {rule.action}
                </span>
              </td>
              <td className="px-3 py-2.5 text-slate-500 capitalize">{rule.direction}</td>
              <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                {(() => {
                  try {
                    return format(parseISO(rule.created_at), 'MM-dd HH:mm');
                  } catch {
                    return rule.created_at;
                  }
                })()}
              </td>
              <td className="px-3 py-2.5">
                {rule.is_active ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-600">
                    <ShieldX className="w-3.5 h-3.5" />
                    <span>Inactive</span>
                  </span>
                )}
              </td>
              <td className="px-3 py-2.5">
                {rule.is_active ? (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="w-3 h-3" />}
                    loading={deleting.has(rule.id)}
                    onClick={() => handleDelete(rule.id)}
                    aria-label={`Deactivate rule ${rule.id}`}
                  />
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rules.length === 0 && (
        <p className="text-center text-slate-600 py-12">No firewall rules defined</p>
      )}
    </div>
  );
};
