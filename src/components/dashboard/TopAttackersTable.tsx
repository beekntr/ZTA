import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { SkeletonRows } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';
import { useBlockIp } from '../../hooks/useRules';
import { errorMessage } from '../../services/api';
import { formatNumber, timeAgoShort } from '../../lib/format';
import type { Attacker } from '../../types';

interface Props {
  data: Attacker[];
  loading?: boolean;
}

export const TopAttackersTable: React.FC<Props> = ({ data, loading }) => {
  const { mutateAsync: blockIp } = useBlockIp();
  const { success, error } = useToast();
  const [blocking, setBlocking] = useState<Set<string>>(new Set());

  const handleBlock = async (ip: string) => {
    setBlocking((s) => new Set([...s, ip]));
    try {
      await blockIp(ip);
      success('IP blocked', `${ip} is now dropped by the firewall`);
    } catch (err) {
      error('Block failed', errorMessage(err));
    } finally {
      setBlocking((s) => {
        const n = new Set(s);
        n.delete(ip);
        return n;
      });
    }
  };

  if (loading) return <SkeletonRows rows={5} />;
  if (data.length === 0) return <p className="py-8 text-center text-sm text-muted">No attackers in this period</p>;

  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="whitespace-nowrap text-left text-xs text-muted">
            <th className="w-12 pb-2 pl-5 pr-3 font-medium">#</th>
            <th className="pb-2 pr-4 font-medium">IP address</th>
            <th className="pb-2 pr-4 text-right font-medium">Attempts</th>
            <th className="hidden pb-2 pr-4 font-medium sm:table-cell">Last seen</th>
            <th className="pb-2 pr-5" />
          </tr>
        </thead>
        <tbody>
          {data.map((attacker, i) => (
            <tr key={attacker.src_ip} className="border-t border-line">
              <td className="py-2.5 pl-5 pr-3 text-xs tabular-nums text-muted">{i + 1}</td>
              <td className="py-2.5 pr-4 font-mono text-xs text-fg">{attacker.src_ip}</td>
              <td className="py-2.5 pr-4 text-right tabular-nums text-fg">{formatNumber(attacker.attempts)}</td>
              <td className="hidden whitespace-nowrap py-2.5 pr-4 text-xs text-muted sm:table-cell">{timeAgoShort(attacker.last_attempt)}</td>
              <td className="py-2.5 pr-5 text-right">
                <Button
                  variant="danger"
                  size="sm"
                  loading={blocking.has(attacker.src_ip)}
                  onClick={() => handleBlock(attacker.src_ip)}
                >
                  Block
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
