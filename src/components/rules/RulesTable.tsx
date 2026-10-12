import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ActionBadge } from '../ui/Badge';
import { SkeletonRows } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';
import { useDeleteRule } from '../../hooks/useRules';
import { errorMessage } from '../../services/api';
import { formatTime } from '../../lib/format';
import type { FirewallRule } from '../../types';

interface Props {
  rules: FirewallRule[];
  loading?: boolean;
}

const HEADERS = ['Name', 'Source', 'Destination', 'Protocol', 'Action', 'Direction', 'Created', 'Status', ''];

export const RulesTable: React.FC<Props> = ({ rules, loading }) => {
  const { mutateAsync: deleteRule } = useDeleteRule();
  const { success, error } = useToast();
  const [deleting, setDeleting] = useState<Set<number>>(new Set());

  const handleDelete = async (id: number) => {
    setDeleting((s) => new Set([...s, id]));
    try {
      await deleteRule(id);
      success('Rule deactivated', `Rule #${id} was removed from the firewall`);
    } catch (err) {
      error('Could not deactivate rule', errorMessage(err));
    } finally {
      setDeleting((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  if (loading) return <SkeletonRows rows={4} />;
  if (rules.length === 0) return <p className="py-12 text-center text-sm text-muted">No firewall rules yet</p>;

  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            {HEADERS.map((h, i) => (
              <th key={h || i} className={`whitespace-nowrap pb-2 pr-4 font-medium ${i === 0 ? 'pl-5' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id} className={`border-t border-line ${rule.is_active ? '' : 'text-muted'}`}>
              <td className="max-w-48 truncate py-3 pl-5 pr-4 font-medium" title={rule.rule_name}>
                <span className={rule.is_active ? 'text-fg' : ''}>{rule.rule_name}</span>
              </td>
              <td className="py-3 pr-4 font-mono text-xs">{rule.src_ip ?? 'Any'}</td>
              <td className="py-3 pr-4 font-mono text-xs">{rule.dst_ip ?? 'Any'}</td>
              <td className="whitespace-nowrap py-3 pr-4 text-xs uppercase">
                {rule.protocol ?? 'any'}
                {rule.dst_port ? `:${rule.dst_port}` : ''}
              </td>
              <td className="py-3 pr-4">
                <ActionBadge action={rule.action} />
              </td>
              <td className="py-3 pr-4 text-xs capitalize">{rule.direction}</td>
              <td className="whitespace-nowrap py-3 pr-4 text-xs tabular-nums">{formatTime(rule.created_at, 'd MMM yyyy')}</td>
              <td className="py-3 pr-4">
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <span className={`h-1.5 w-1.5 rounded-full ${rule.is_active ? 'bg-good-mark' : 'bg-line-strong'}`} />
                  {rule.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 pr-5 text-right">
                {rule.is_active ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    loading={deleting.has(rule.id)}
                    onClick={() => handleDelete(rule.id)}
                    aria-label={`Deactivate rule ${rule.id}`}
                    title="Deactivate rule"
                  />
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
