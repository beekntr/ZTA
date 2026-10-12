import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import type { LogType, TrustStatus } from '../../types';

type Tone = 'neutral' | 'accent' | 'good' | 'warning' | 'critical';

const TONE_STYLES: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-fg-2',
  accent: 'bg-accent-soft text-accent-text',
  good: 'bg-good-soft text-good',
  warning: 'bg-warning-soft text-warning',
  critical: 'bg-critical-soft text-critical',
};

const Pill: React.FC<{ tone: Tone; className?: string; title?: string; children: React.ReactNode }> = ({
  tone,
  className = '',
  title,
  children,
}) => (
  <span
    title={title}
    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ${TONE_STYLES[tone]} ${className}`}
  >
    {children}
  </span>
);

/** Status meaning of a log type: dropped/blocked, allowed, or noteworthy. */
function logTypeTone(type: string): Tone {
  if (type.includes('API-BLOCK')) return 'accent';
  if (type.includes('SSH-PUBLIC')) return 'warning';
  if (type.includes('ALLOW')) return 'good';
  if (type.includes('DROP') || type.includes('BLOCK')) return 'critical';
  return 'neutral';
}

interface BadgeProps {
  type: LogType | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, className = '' }) => (
  <Pill tone={logTypeTone(type)} title={type} className={`font-mono ${className}`}>
    {type.replace(/^ZTA-/, '')}
  </Pill>
);

export const ActionBadge: React.FC<{ action: string }> = ({ action }) => {
  const blocks = ['block', 'drop'].includes(action.toLowerCase());
  return (
    <Pill tone={blocks ? 'critical' : 'good'} className="capitalize">
      {action}
    </Pill>
  );
};

const STATUS: Record<TrustStatus, { tone: Tone; label: string; Icon: typeof ShieldCheck }> = {
  trusted: { tone: 'good', label: 'Trusted', Icon: ShieldCheck },
  suspicious: { tone: 'warning', label: 'Suspicious', Icon: ShieldAlert },
  blocked: { tone: 'critical', label: 'Blocked', Icon: ShieldX },
};

export const StatusBadge: React.FC<{ status: TrustStatus }> = ({ status }) => {
  const { tone, label, Icon } = STATUS[status] ?? STATUS.suspicious;
  return (
    <Pill tone={tone}>
      <Icon className="h-3 w-3" />
      {label}
    </Pill>
  );
};

// A zone is where a device sits, not a verdict, so it stays neutral.
const ZONES: Record<string, string> = {
  trusted: 'Trusted zone',
  dmz: 'DMZ',
  untrust: 'Untrusted zone',
};

export const ZoneBadge: React.FC<{ zone: string | null | undefined }> = ({ zone }) => (
  <Pill tone="neutral">{ZONES[zone?.toLowerCase() ?? ''] ?? zone ?? 'Unknown zone'}</Pill>
);
