import React, { useState } from 'react';
import { Cpu, ShieldCheck, AlertTriangle, ShieldX, Search } from 'lucide-react';
import { useDevices, useDeviceTrust } from '../hooks/useDevices';
import { DeviceCard } from '../components/devices/DeviceCard';
import { RegisterDeviceForm } from '../components/devices/RegisterDeviceForm';
import { TrustScoreCircle } from '../components/devices/TrustScoreCircle';
import { StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/dashboard/StatsCard';
import { validateIp } from '../services/api';
import { ReadOnlyNotice } from '../components/ui/ReadOnlyNotice';

export const Devices: React.FC = () => {
  const { data: devicesData, isLoading } = useDevices();
  const devices = Array.isArray(devicesData) ? devicesData : [];
  const [trustIp, setTrustIp] = useState('');
  const [checkIp, setCheckIp] = useState('');
  const [ipError, setIpError] = useState('');

  const { data: trustData, isLoading: trustLoading } = useDeviceTrust(checkIp, checkIp.length > 0);

  const trusted = devices.filter((d) => d.trust_score > 70);
  // Same thresholds as the API: > 70 trusted, > 30 suspicious, otherwise blocked
  const suspicious = devices.filter((d) => !d.is_blocked && d.trust_score > 30 && d.trust_score <= 70);
  const blocked = devices.filter((d) => d.trust_score <= 30 || d.is_blocked);

  const handleTrustCheck = () => {
    if (!validateIp(trustIp)) {
      setIpError('Enter a valid IP address');
      return;
    }
    setIpError('');
    setCheckIp(trustIp);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ReadOnlyNotice />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Devices"
          value={devices.length}
          icon={<Cpu className="w-5 h-5" />}
          color="cyan"
          loading={isLoading}
        />
        <StatsCard
          title="Trusted"
          value={trusted.length}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="emerald"
          trendValue="Score > 70"
          loading={isLoading}
        />
        <StatsCard
          title="Suspicious"
          value={suspicious.length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
          trendValue="Score 31–70"
          loading={isLoading}
        />
        <StatsCard
          title="Blocked"
          value={blocked.length}
          icon={<ShieldX className="w-5 h-5" />}
          color="red"
          trendValue="Score ≤ 30 or blocked"
          loading={isLoading}
        />
      </div>

      {/* Device grid */}
      <Card>
        <CardHeader
          title="Device Registry"
          subtitle={`${devices.length} registered devices`}
          icon={<Cpu className="w-4 h-4" />}
        />
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 bg-border/40 rounded-xl" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <p className="text-center text-slate-600 py-12">No devices registered</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </Card>

      {/* Register + Trust Check */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Register Device"
            subtitle="Add a new device to the registry"
            icon={<Cpu className="w-4 h-4" />}
          />
          <RegisterDeviceForm />
        </Card>

        <Card>
          <CardHeader
            title="Trust Score Check"
            subtitle="Lookup trust score for any IP"
            icon={<Search className="w-4 h-4" />}
          />
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={trustIp}
                onChange={(e) => { setTrustIp(e.target.value); setIpError(''); }}
                placeholder="Enter IP address..."
                className={`flex-1 px-3 py-2 rounded-lg bg-border/40 border text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono ${
                  ipError ? 'border-red-500/60' : 'border-border'
                }`}
                onKeyDown={(e) => e.key === 'Enter' && handleTrustCheck()}
              />
              <Button
                variant="primary"
                loading={trustLoading}
                icon={<Search className="w-4 h-4" />}
                onClick={handleTrustCheck}
              >
                Check
              </Button>
            </div>
            {ipError && <p className="text-xs text-red-400">{ipError}</p>}

            {trustData && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-border/30 border border-border">
                <TrustScoreCircle score={trustData.trust_score} size={80} />
                <div>
                  <p className="font-mono text-sm font-bold text-slate-200">
                    {trustData.ip_address}
                  </p>
                  <StatusBadge status={trustData.status} />
                  <div className="grid grid-cols-2 gap-x-6 mt-2 text-xs text-slate-500">
                    <span>Total events: <span className="text-slate-300">{trustData.total_events}</span></span>
                    <span>Blocked: <span className="text-red-400">{trustData.blocked_attempts}</span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
