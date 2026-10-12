import React, { useState } from 'react';
import { Server, ShieldCheck, ShieldAlert, ShieldX, Search } from 'lucide-react';
import { useDevices, useDeviceTrust } from '../hooks/useDevices';
import { DeviceCard } from '../components/devices/DeviceCard';
import { RegisterDeviceForm } from '../components/devices/RegisterDeviceForm';
import { TrustScoreCircle } from '../components/devices/TrustScoreCircle';
import { StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { StatsCard } from '../components/dashboard/StatsCard';
import { ReadOnlyNotice } from '../components/ui/ReadOnlyNotice';
import { validateIp } from '../services/api';
import { formatNumber } from '../lib/format';

export const Devices: React.FC = () => {
  const { data: devicesData, isLoading } = useDevices();
  const devices = Array.isArray(devicesData) ? devicesData : [];
  const [trustIp, setTrustIp] = useState('');
  const [checkIp, setCheckIp] = useState('');
  const [ipError, setIpError] = useState('');

  const { data: trustData, isFetching: trustLoading } = useDeviceTrust(checkIp, checkIp.length > 0);

  // Same thresholds as the API: > 70 trusted, > 30 suspicious, otherwise blocked
  const trusted = devices.filter((d) => !d.is_blocked && d.trust_score > 70);
  const suspicious = devices.filter((d) => !d.is_blocked && d.trust_score > 30 && d.trust_score <= 70);
  const blocked = devices.filter((d) => d.trust_score <= 30 || d.is_blocked);

  const handleTrustCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIp(trustIp)) {
      setIpError('Enter a valid IP address');
      return;
    }
    setIpError('');
    setCheckIp(trustIp.trim());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ReadOnlyNotice />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatsCard label="Devices" value={devices.length} hint="In the registry" icon={<Server />} loading={isLoading} />
        <StatsCard label="Trusted" value={trusted.length} hint="Trust score above 70" icon={<ShieldCheck />} loading={isLoading} />
        <StatsCard label="Suspicious" value={suspicious.length} hint="Trust score 31–70" icon={<ShieldAlert />} loading={isLoading} />
        <StatsCard label="Blocked" value={blocked.length} hint="Score 30 or less, or blocked" icon={<ShieldX />} loading={isLoading} />
      </div>

      <Card>
        <CardHeader title="Device registry" subtitle={`${devices.length} registered devices`} />
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">No devices registered</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Register a device" subtitle="New devices start in the untrusted zone" />
          <RegisterDeviceForm />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Check a trust score" subtitle="Share of an IP's traffic that was not dropped" />
          <form onSubmit={handleTrustCheck}>
            <label htmlFor="trust-ip" className="field-label">
              IP address
            </label>
            <div className="flex gap-2">
              <input
                id="trust-ip"
                type="text"
                value={trustIp}
                onChange={(e) => {
                  setTrustIp(e.target.value);
                  setIpError('');
                }}
                placeholder="e.g. 94.154.43.56"
                aria-invalid={ipError ? true : undefined}
                className="field font-mono"
              />
              <Button type="submit" variant="secondary" loading={trustLoading} icon={<Search className="h-4 w-4" />}>
                Check
              </Button>
            </div>
            {ipError && <p className="field-error">{ipError}</p>}
          </form>

          {trustData && (
            <div className="mt-5 flex items-center gap-4 rounded-lg bg-surface-2 p-4">
              <TrustScoreCircle score={trustData.trust_score} size={72} />
              <div className="min-w-0 space-y-1.5">
                <p className="truncate font-mono text-sm font-medium text-fg">{trustData.ip_address}</p>
                <StatusBadge status={trustData.status} />
                <p className="text-xs text-muted">
                  <span className="tabular-nums text-fg-2">{formatNumber(trustData.blocked_attempts)}</span> of{' '}
                  <span className="tabular-nums text-fg-2">{formatNumber(trustData.total_events)}</span> events dropped
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
