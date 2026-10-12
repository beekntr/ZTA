import React from 'react';
import { Clock } from 'lucide-react';
import { TrustScoreCircle } from './TrustScoreCircle';
import { StatusBadge, ZoneBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useBlockIp } from '../../hooks/useRules';
import { errorMessage } from '../../services/api';
import { timeAgo } from '../../lib/format';
import type { Device, TrustStatus } from '../../types';

interface Props {
  device: Device;
}

export const DeviceCard: React.FC<Props> = ({ device }) => {
  const { mutateAsync: blockIp, isPending } = useBlockIp();
  const { success, error } = useToast();

  const handleBlock = async () => {
    try {
      await blockIp(device.ip_address);
      success('Device blocked', `${device.ip_address} is now dropped by the firewall`);
    } catch (err) {
      error('Block failed', errorMessage(err));
    }
  };

  const status: TrustStatus = device.is_blocked
    ? 'blocked'
    : device.trust_score > 70
      ? 'trusted'
      : device.trust_score > 30
        ? 'suspicious'
        : 'blocked';

  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-medium text-fg">{device.ip_address}</p>
          <p className="mt-0.5 truncate text-xs text-muted">{device.hostname ?? 'Unknown host'}</p>
        </div>
        <TrustScoreCircle score={device.trust_score} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <ZoneBadge zone={device.zone} />
        <StatusBadge status={status} />
      </div>
      {device.mac_address && <p className="mt-2 truncate font-mono text-[11px] text-muted">{device.mac_address}</p>}

      {/* Footer pinned to the bottom so cards in a row line up */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Clock className="h-3 w-3" />
            {timeAgo(device.last_seen)}
          </span>
          <Button variant="danger" size="sm" loading={isPending} onClick={handleBlock} disabled={device.is_blocked}>
            {device.is_blocked ? 'Blocked' : 'Block'}
          </Button>
        </div>
      </div>
    </div>
  );
};
