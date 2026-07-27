import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ShieldBan, Clock } from 'lucide-react';
import { TrustScoreCircle } from './TrustScoreCircle';
import { ZoneBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useBlockIp } from '../../hooks/useRules';
import type { Device } from '../../types';

interface Props {
  device: Device;
}

export const DeviceCard: React.FC<Props> = ({ device }) => {
  const { mutateAsync: blockIp, isPending } = useBlockIp();
  const { success, error } = useToast();

  const handleBlock = async () => {
    try {
      await blockIp(device.ip_address);
      success('Device Blocked', `${device.ip_address} has been blocked`);
    } catch {
      error('Block Failed', 'Could not block device');
    }
  };

  const lastSeen = (() => {
    try {
      if (!device.last_seen) return 'Never';
      return formatDistanceToNow(parseISO(device.last_seen), { addSuffix: true });
    } catch {
      return device.last_seen ?? 'Unknown';
    }
  })();

  const scoreLabel =
    device.trust_score > 70 ? 'Trusted' : device.trust_score > 30 ? 'Suspicious' : 'Blocked';
  const scoreLabelColor =
    device.trust_score > 70
      ? 'text-emerald-400'
      : device.trust_score > 30
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div
      className={`
        relative rounded-xl border bg-card/80 backdrop-blur-sm p-4 transition-all duration-300
        hover:shadow-lg hover:border-opacity-60
        ${device.is_blocked ? 'border-red-500/30 shadow-red-500/10' : 'border-border hover:border-cyan-500/30'}
      `}
    >
      {device.is_blocked && (
        <div className="absolute top-2 right-2">
          <span className="text-[10px] bg-red-900/60 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-medium">
            BLOCKED
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <TrustScoreCircle score={device.trust_score} />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-bold text-slate-100 truncate">{device.ip_address}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {device.hostname ?? 'Unknown host'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <ZoneBadge zone={device.zone} />
            <span className={`text-xs font-medium ${scoreLabelColor}`}>{scoreLabel}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{lastSeen}</span>
        </div>
        <Button
          variant="danger"
          size="sm"
          icon={<ShieldBan className="w-3 h-3" />}
          loading={isPending}
          onClick={handleBlock}
          disabled={device.is_blocked}
        >
          {device.is_blocked ? 'Blocked' : 'Block'}
        </Button>
      </div>

      {device.mac_address && (
        <p className="mt-2 text-[10px] font-mono text-slate-600 truncate">{device.mac_address}</p>
      )}
    </div>
  );
};
