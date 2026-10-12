import React, { useState } from 'react';
import { ShieldBan } from 'lucide-react';
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
      success('IP blocked', `${ip} is now dropped on input and forward`);
      setRecentBlocked((prev) => [{ ip, time: new Date() }, ...prev.slice(0, 4)]);
      setIp('');
    } catch (err) {
      error('Block failed', errorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleBlock}>
        <label htmlFor="quick-block-ip" className="field-label">
          IP address or network
        </label>
        <div className="flex gap-2">
          <input
            id="quick-block-ip"
            type="text"
            value={ip}
            onChange={(e) => {
              setIp(e.target.value);
              setIpError('');
            }}
            placeholder="e.g. 203.0.113.7"
            aria-invalid={ipError ? true : undefined}
            className="field font-mono"
          />
          <Button type="submit" variant="primary" loading={isPending} icon={<ShieldBan className="h-4 w-4" />}>
            Block
          </Button>
        </div>
        {ipError && <p className="field-error">{ipError}</p>}
        <p className="mt-2 text-xs text-muted">
          Blocks the source on this server and on traffic it forwards. Your gateway and this server are protected.
        </p>
      </form>

      {recentBlocked.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Blocked this session</p>
          <ul className="divide-y divide-line rounded-lg border border-line">
            {recentBlocked.map((entry, i) => (
              <li key={i} className="flex items-center justify-between px-3 py-2">
                <span className="font-mono text-xs text-fg">{entry.ip}</span>
                <span className="text-xs tabular-nums text-muted">{format(entry.time, 'HH:mm:ss')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
