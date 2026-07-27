import React, { useEffect, useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ShieldBan, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useBlockIp } from '../../hooks/useRules';
import type { Attacker, GeoInfo } from '../../types';

interface Props {
  attackers: Attacker[];
  loading?: boolean;
}

async function fetchGeo(ip: string): Promise<GeoInfo | null> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp`);
    const data = await res.json();
    if (data.status === 'success') return data as GeoInfo;
    return null;
  } catch {
    return null;
  }
}

export const AttackerLeaderboard: React.FC<Props> = ({ attackers: attackersProp, loading }) => {
  const attackers = Array.isArray(attackersProp) ? attackersProp : [];
  const { mutateAsync: blockIp } = useBlockIp();
  const { success, error } = useToast();
  const [blocking, setBlocking] = useState<Set<string>>(new Set());
  const [geoData, setGeoData] = useState<Record<string, GeoInfo | null>>({});

  // Fetch geo for top 5 attackers
  useEffect(() => {
    attackers.slice(0, 5).forEach(async (a) => {
      if (geoData[a.src_ip] !== undefined) return;
      const geo = await fetchGeo(a.src_ip);
      setGeoData((prev) => ({ ...prev, [a.src_ip]: geo }));
    });
  }, [attackers]);

  const handleBlock = async (ip: string) => {
    setBlocking((s) => new Set([...s, ip]));
    try {
      await blockIp(ip);
      success('IP Blocked', `${ip} added to blocklist`);
    } catch {
      error('Block Failed', 'Operation failed');
    } finally {
      setBlocking((s) => { const n = new Set(s); n.delete(ip); return n; });
    }
  };

  const maxAttempts = attackers[0]?.attempts ?? 1;

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-border/60 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attackers.map((attacker, i) => {
        const geo = geoData[attacker.src_ip];
        const barPct = Math.round((attacker.attempts / maxAttempts) * 100);
        return (
          <div
            key={attacker.src_ip}
            className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-border/20 border border-border/60 overflow-hidden hover:border-red-500/20 transition-all group"
          >
            {/* Progress bar bg */}
            <div
              className="absolute inset-0 bg-red-500/5 transition-all"
              style={{ width: `${barPct}%` }}
            />

            {/* Rank */}
            <span className="relative text-sm font-bold text-slate-600 w-6 text-center shrink-0">
              #{i + 1}
            </span>

            {/* IP + Geo */}
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-slate-200">
                  {attacker.src_ip}
                </span>
                {geo?.countryCode && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {geo.country} · {geo.city}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                <span>
                  {(() => {
                    try {
                      return formatDistanceToNow(parseISO(attacker.last_attempt), { addSuffix: true });
                    } catch {
                      return attacker.last_attempt;
                    }
                  })()}
                </span>
                {geo?.isp && <span className="truncate max-w-32">{geo.isp}</span>}
              </div>
            </div>

            {/* Attempts */}
            <div className="relative text-right shrink-0">
              <span className="text-xl font-bold text-red-400 font-mono">
                {attacker.attempts.toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-600">attempts</p>
            </div>

            {/* Block button */}
            <Button
              variant="danger"
              size="sm"
              icon={<ShieldBan className="w-3.5 h-3.5" />}
              loading={blocking.has(attacker.src_ip)}
              onClick={() => handleBlock(attacker.src_ip)}
              className="relative opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              Block
            </Button>
          </div>
        );
      })}
    </div>
  );
};
