// ============================================================
// All TypeScript interfaces for the ZTA Firewall Dashboard
// ============================================================

export interface Stats {
  window_days: number;
  total_logs: number;
  by_type: Array<{ log_type: string; count: number }>;
  top_attackers: Array<{ src_ip: string; attempts: number }>;
  unique_attackers: number;
  daily_activity: Array<{ date: string; count: number }>;
  active_rules: number;
  total_devices: number;
}

export interface ThreatStats {
  hours: number;
  hourly: Array<{ hour: string; count: number }>;
  protocols: Array<{ protocol: string; count: number }>;
}

export interface Log {
  id: number;
  timestamp: string;
  log_type: string;
  src_ip: string;
  dst_ip: string;
  protocol: string;
  src_port: number | null;
  dst_port: number | null;
  in_iface: string;
  out_iface: string | null;
  raw_log: string;
  created_at: string;
}

export interface Attacker {
  src_ip: string;
  attempts: number;
  last_attempt: string;
}

export interface FirewallRule {
  id: number;
  rule_name: string;
  src_ip: string | null;
  dst_ip: string | null;
  protocol: string;
  dst_port: number | null;
  action: string;
  direction: string;
  is_active: boolean;
  created_at: string;
}

export interface Device {
  id: number;
  ip_address: string;
  mac_address: string | null;
  hostname: string | null;
  zone: string;
  trust_score: number;
  first_seen: string;
  last_seen: string;
  is_blocked: boolean;
}

export interface TrustScore {
  ip_address: string;
  trust_score: number;
  blocked_attempts: number;
  total_events: number;
  status: 'trusted' | 'suspicious' | 'blocked';
}

export interface RuleCreate {
  rule_name: string;
  src_ip?: string;
  dst_ip?: string;
  protocol?: string;
  dst_port?: number;
  action: 'block' | 'allow';
  direction: 'input' | 'output' | 'forward' | 'all';
}

export interface DeviceRegister {
  ip_address: string;
  mac_address?: string;
  hostname?: string;
  zone?: string;
}

export interface LogFilters {
  limit?: number;
  log_type?: string;
  src_ip?: string;
  exclude_internal?: boolean;
}

export interface GeoInfo {
  country: string;
  countryCode: string;
  city: string;
  isp: string;
}

export type TrustStatus = 'trusted' | 'suspicious' | 'blocked';
export type LogType =
  | 'ZTA-INPUT-DROP'
  | 'ZTA-FORWARD-DROP'
  | 'ZTA-BLOCKED-U2T'
  | 'ZTA-BLOCKED-T2U'
  | 'ZTA-SSH-ALLOW'
  | 'ZTA-ALLOW-D2T'
  | 'ZTA-ALLOW-D2U'
  | 'ZTA-SSH-PUBLIC'
  | 'ZTA-API-BLOCK'
  | string;
