import React, { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ShieldBan } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useBlockIp } from '../../hooks/useRules';
import type { Attacker } from '../../types';

interface Props {
  data: Attacker[];
  loading?: boolean;
}

export const TopAttackersTable: React.FC<Props> = ({ data, loading }) => {
  const { mutateAsync: blockIp } = useBlockIp();
  const { success, error } = useToast();
  const [blocking, setBlocking] = useState<Set<string>>(new Set());
  const [cooldown, setCooldown] = useState<Set<string>>(new Set());

  const handleBlock = async (ip: string) => {
    if (cooldown.has(ip)) return;
    setBlocking((s) => new Set([...s, ip]));
    try {
      await blockIp(ip);
      success('IP Blocked', `${ip} has been added to blocklist`);
      setCooldown((s) => new Set([...s, ip]));
      setTimeout(() => setCooldown((s) => { const n = new Set(s); n.delete(ip); return n; }), 3000);
    } catch {
      error('Block Failed', 'Could not block IP — operation failed');
    } finally {
      setBlocking((s) => { const n = new Set(s); n.delete(ip); return n; });
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-[#1e2a45]/60 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e2a45]">
            <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
              IP Address
            </th>
            <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Attempts
            </th>
            <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
              Last Seen
            </th>
            <th className="py-2 px-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2a45]/50">
          {data.map((attacker, i) => (
            <tr key={attacker.src_ip} className="hover:bg-[#1e2a45]/20 transition-colors group">
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-mono w-4">#{i + 1}</span>
                  <span className="font-mono text-slate-200 text-xs">{attacker.src_ip}</span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-right">
                <span className="font-bold text-red-400 font-mono text-sm">
                  {attacker.attempts.toLocaleString()}
                </span>
              </td>
              <td className="py-2.5 px-3 text-slate-500 text-xs hidden sm:table-cell">
                {(() => {
                  try {
                    return formatDistanceToNow(parseISO(attacker.last_attempt), { addSuffix: true });
                  } catch {
                    return attacker.last_attempt;
                  }
                })()}
              </td>
              <td className="py-2.5 px-3">
                <Button
                  variant="danger"
                  size="sm"
                  icon={<ShieldBan className="w-3 h-3" />}
                  loading={blocking.has(attacker.src_ip)}
                  disabled={cooldown.has(attacker.src_ip)}
                  onClick={() => handleBlock(attacker.src_ip)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Block
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <p className="text-center text-slate-600 text-sm py-8">No attackers detected</p>
      )}
    </div>
  );
};
