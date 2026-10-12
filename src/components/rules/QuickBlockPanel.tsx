import React, { useState } from 'react';
import { ShieldBan, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useBlockIp } from '../../hooks/useRules';
import { errorMessage, validateIp } from '../../services/api';
import { format } from 'date-fns';

export const QuickBlockPanel: React.FC = () => {
  const [ip, setIp] = useState('');
  const [ipError, setIpError] = useState('');
  const [recentBlocked, setRecentBlocked] = useState<Array<{ ip: string; time: Date }>>([]);
  const { mutateAsync: blockIp, isPending } = useBlockIp();
  const { success, error } = useToast();

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIp(ip, true)) {
      setIpError('Enter a valid IP address or network (/16 or narrower)');
      return;
    }
    setIpError('');
    try {
      await blockIp(ip);
      success('IP Blocked', `${ip} blocked successfully`);
      setRecentBlocked((prev) => [{ ip, time: new Date() }, ...prev.slice(0, 4)]);
      setIp('');
    } catch (err) {
      error('Block Failed', errorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleBlock} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={ip}
            onChange={(e) => { setIp(e.target.value); setIpError(''); }}
            placeholder="IP or network to block (e.g. 1.2.3.4)"
            className={`w-full px-3 py-2 rounded-lg bg-[#1e2a45]/40 border text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-red-500/50 font-mono ${
              ipError ? 'border-red-500/60' : 'border-[#1e2a45]'
            }`}
          />
          {ipError && <p className="text-xs text-red-400 mt-1">{ipError}</p>}
        </div>
        <Button
          type="submit"
          variant="danger"
          loading={isPending}
          icon={<ShieldBan className="w-4 h-4" />}
        >
          Block Now
        </Button>
      </form>

      {recentBlocked.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
            Recently Blocked
          </p>
          <div className="space-y-1.5">
            {recentBlocked.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-900/10 border border-red-500/10"
              >
                <span className="font-mono text-xs text-red-400">{entry.ip}</span>
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(entry.time, 'HH:mm:ss')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
