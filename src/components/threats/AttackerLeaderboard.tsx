import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { SkeletonRows } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';
import { useBlockIp } from '../../hooks/useRules';
import { errorMessage } from '../../services/api';
import { formatNumber, timeAgoShort } from '../../lib/format';
import type { Attacker, GeoInfo } from '../../types';

interface Props {
  attackers: Attacker[];
  loading?: boolean;
}

// HTTPS provider (an http:// lookup is blocked as mixed content on the HTTPS
// site). Cached per page load so polling does not repeat lookups.
const geoCache = new Map<string, Promise<GeoInfo | null>>();
const PRIVATE_IP = /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
const GEO_LOOKUPS = 10;

function fetchGeo(ip: string): Promise<GeoInfo | null> {
  if (PRIVATE_IP.test(ip)) return Promise.resolve(null);
  let pending = geoCache.get(ip);
  if (!pending) {
    pending = fetch(`https://ipwho.is/${encodeURIComponent(ip)}`)
      .then((res) => res.json())
      .then((data) =>
        data?.success
          ? { country: data.country, countryCode: data.country_code, city: data.city, isp: data.connection?.isp ?? '' }
          : null,
      )
      .catch(() => null);
    geoCache.set(ip, pending);
  }
  return pending;
}

export const AttackerLeaderboard: React.FC<Props> = ({ attackers: attackersProp, loading }) => {
  const attackers = useMemo(() => (Array.isArray(attackersProp) ? attackersProp : []), [attackersProp]);
  const { mutateAsync: blockIp } = useBlockIp();
  const { success, error } = useToast();
  const [blocking, setBlocking] = useState<Set<string>>(new Set());
  const [geoData, setGeoData] = useState<Record<string, GeoInfo | null>>({});

  useEffect(() => {
    let cancelled = false;
    attackers.slice(0, GEO_LOOKUPS).forEach((a) => {
      fetchGeo(a.src_ip).then((geo) => {
        if (!cancelled) setGeoData((prev) => (a.src_ip in prev ? prev : { ...prev, [a.src_ip]: geo }));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [attackers]);

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

  if (loading) return <SkeletonRows rows={6} className="h-12" />;
  if (attackers.length === 0) return <p className="py-8 text-center text-sm text-muted">No attackers in this period</p>;

  const maxAttempts = Math.max(1, ...attackers.map((a) => a.attempts));

  return (
    <ol className="-my-1">
      {attackers.map((attacker, i) => {
        const geo = geoData[attacker.src_ip];
        const place = geo ? [geo.city, geo.country].filter(Boolean).join(', ') : '';
        return (
          <li key={attacker.src_ip} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
            <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate font-mono text-sm text-fg">{attacker.src_ip}</span>
                <span className="shrink-0 text-sm font-medium tabular-nums text-fg">{formatNumber(attacker.attempts)}</span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between gap-3 text-xs text-muted">
                <span className="truncate">
                  {place || 'Location unknown'}
                  {geo?.isp ? ` · ${geo.isp}` : ''}
                </span>
                <span className="shrink-0">{timeAgoShort(attacker.last_attempt)}</span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-chart-1"
                  style={{ width: `${Math.max(2, (attacker.attempts / maxAttempts) * 100)}%` }}
                />
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              loading={blocking.has(attacker.src_ip)}
              onClick={() => handleBlock(attacker.src_ip)}
            >
              Block
            </Button>
          </li>
        );
      })}
    </ol>
  );
};
