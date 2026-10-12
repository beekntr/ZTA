import axios, { AxiosError } from 'axios';
import type {
  Stats,
  ThreatStats,
  Log,
  Attacker,
  FirewallRule,
  Device,
  TrustScore,
  RuleCreate,
  DeviceRegister,
  LogFilters,
} from '../types';

// ────────────────────────────────────────────────────────────
// Axios instance
// ────────────────────────────────────────────────────────────
// Empty base URL = same origin: nginx proxies /api in production, Vite in dev.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

// ────────────────────────────────────────────────────────────
// Admin key — the public dashboard is read-only; changes need the key.
// Kept in sessionStorage, so it is forgotten when the tab closes.
// ────────────────────────────────────────────────────────────
const ADMIN_KEY_STORAGE = 'zta-admin-key';
const adminListeners = new Set<() => void>();

let adminKey: string | null = (() => {
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE);
  } catch {
    return null;
  }
})();

export function getAdminKey(): string | null {
  return adminKey;
}

export function setAdminKey(key: string | null): void {
  adminKey = key;
  try {
    if (key) sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    else sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {
    // storage unavailable (private mode) — the key still works for this page load
  }
  adminListeners.forEach((listener) => listener());
}

export function subscribeAdminKey(listener: () => void): () => void {
  adminListeners.add(listener);
  return () => adminListeners.delete(listener);
}

apiClient.interceptors.request.use((config) => {
  if (adminKey && config.method !== 'get') config.headers.set('X-Admin-Key', adminKey);
  return config;
});

apiClient.interceptors.response.use(undefined, (err: AxiosError) => {
  // Key was rotated on the server: drop back to read-only mode.
  if (err.response?.status === 401 && err.config?.method !== 'get') setAdminKey(null);
  return Promise.reject(err);
});

/** Human-readable message for a failed API call. */
export function errorMessage(err: unknown): string {
  const e = err as AxiosError<{ detail?: unknown }>;
  if (e.response?.status === 401) return 'Admin key required — this public demo is read-only';
  const detail = e.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg).replace(/^Value error, /, '');
  if (e.code === 'ECONNABORTED') return 'The server took too long to respond';
  return e.message || 'Operation failed';
}

// ────────────────────────────────────────────────────────────
// Sanitization helpers
// ────────────────────────────────────────────────────────────
const IPV4 = /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

/** Valid IPv4/IPv6 address; with allowCidr also a network no broader than /16 (v6: /48). */
export function validateIp(ip: string, allowCidr = false): boolean {
  const [addr, prefix, ...rest] = ip.trim().split('/');
  if (rest.length || (prefix !== undefined && !allowCidr)) return false;
  const bits = prefix === undefined ? null : /^\d{1,3}$/.test(prefix) ? Number(prefix) : NaN;
  if (IPV4.test(addr)) return bits === null || (bits >= 16 && bits <= 32);
  if (/^[0-9a-fA-F:.]+$/.test(addr) && (addr.match(/:/g) ?? []).length >= 2) {
    return bits === null || (bits >= 48 && bits <= 128);
  }
  return false;
}

export function sanitizeString(s: string): string {
  return s.replace(/[<>"'`]/g, '').trim().slice(0, 256);
}

/**
 * Safely coerce any API response to an array.
 * The backend may return:
 *   - Array directly           → use as-is
 *   - { items: [...] }         → extract items
 *   - { data: [...] }          → extract data
 *   - { logs: [...] }          → extract logs
 *   - { results: [...] }       → extract results
 *   - anything else            → return []
 */
export function toArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    for (const key of ['items', 'data', 'logs', 'results', 'rules', 'devices', 'attackers']) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

// ────────────────────────────────────────────────────────────
// Health & auth
// ────────────────────────────────────────────────────────────
export type HealthState = 'ok' | 'degraded' | 'down';

export async function getHealth(): Promise<HealthState> {
  try {
    const { data } = await apiClient.get<{ status?: string }>('/api/health');
    return data?.status === 'ok' ? 'ok' : 'degraded';
  } catch {
    return 'down';
  }
}

/** True if the server accepts this admin key. */
export async function verifyAdminKey(key: string): Promise<boolean> {
  try {
    await apiClient.get('/api/auth/check', { headers: { 'X-Admin-Key': key } });
    return true;
  } catch (err) {
    if ((err as AxiosError).response?.status === 401) return false;
    throw err;
  }
}

// ────────────────────────────────────────────────────────────
// Stats
// ────────────────────────────────────────────────────────────
export async function getStats(days = 7, signal?: AbortSignal): Promise<Stats> {
  const { data } = await apiClient.get<Stats>('/api/stats/', { params: { days }, signal });
  // Ensure nested arrays exist
  return {
    window_days: Number(data?.window_days ?? days),
    total_logs: Number(data?.total_logs ?? 0),
    by_type: toArray<Stats['by_type'][number]>(data?.by_type),
    top_attackers: toArray<Stats['top_attackers'][number]>(data?.top_attackers),
    unique_attackers: Number(data?.unique_attackers ?? 0),
    daily_activity: toArray<Stats['daily_activity'][number]>(data?.daily_activity),
    active_rules: Number(data?.active_rules ?? 0),
    total_devices: Number(data?.total_devices ?? 0),
  };
}

export async function getThreatStats(hours = 24, signal?: AbortSignal): Promise<ThreatStats> {
  const { data } = await apiClient.get<ThreatStats>('/api/stats/threats', { params: { hours }, signal });
  return {
    hours: Number(data?.hours ?? hours),
    hourly: toArray<ThreatStats['hourly'][number]>(data?.hourly),
    protocols: toArray<ThreatStats['protocols'][number]>(data?.protocols),
  };
}

// ────────────────────────────────────────────────────────────
// Logs
// ────────────────────────────────────────────────────────────
export async function getLogs(filters: LogFilters = {}, signal?: AbortSignal): Promise<Log[]> {
  const params: Record<string, string | number | boolean> = {
    limit: filters.limit ?? 50,
  };
  if (filters.log_type) params.log_type = filters.log_type;
  if (filters.src_ip) params.src_ip = filters.src_ip;
  if (filters.exclude_internal) params.exclude_internal = true;
  const { data } = await apiClient.get<unknown>('/api/logs/', { params, signal });
  return toArray<Log>(data);
}

export async function getAttackers(limit = 10, signal?: AbortSignal): Promise<Attacker[]> {
  const { data } = await apiClient.get<unknown>('/api/logs/attackers', { params: { limit }, signal });
  return toArray<Attacker>(data);
}

// ────────────────────────────────────────────────────────────
// Rules (writes are never retried: a retry could apply them twice)
// ────────────────────────────────────────────────────────────
export async function getRules(signal?: AbortSignal): Promise<FirewallRule[]> {
  const { data } = await apiClient.get<unknown>('/api/rules/', { signal });
  return toArray<FirewallRule>(data);
}

export async function addRule(rule: RuleCreate): Promise<FirewallRule> {
  const payload: RuleCreate = {
    ...rule,
    rule_name: sanitizeString(rule.rule_name),
  };
  const { data } = await apiClient.post<FirewallRule>('/api/rules/', payload);
  return data;
}

export async function deleteRule(ruleId: number): Promise<void> {
  await apiClient.delete(`/api/rules/${ruleId}`);
}

export async function blockIp(srcIp: string): Promise<unknown> {
  if (!validateIp(srcIp, true)) throw new Error('Invalid IP address');
  const { data } = await apiClient.post('/api/rules/block-ip', null, {
    params: { src_ip: srcIp.trim() },
  });
  return data;
}

// ────────────────────────────────────────────────────────────
// Devices
// ────────────────────────────────────────────────────────────
export async function getDevices(signal?: AbortSignal): Promise<Device[]> {
  const { data } = await apiClient.get<unknown>('/api/devices/', { signal });
  return toArray<Device>(data);
}

export async function registerDevice(device: DeviceRegister): Promise<Device> {
  const payload: DeviceRegister = {
    ...device,
    ip_address: device.ip_address.trim(),
    hostname: device.hostname ? sanitizeString(device.hostname) : undefined,
  };
  const { data } = await apiClient.post<Device>('/api/devices/register', payload);
  return data;
}

export async function getDeviceTrust(ipAddress: string, signal?: AbortSignal): Promise<TrustScore> {
  if (!validateIp(ipAddress)) throw new Error('Invalid IP address');
  const { data } = await apiClient.get<TrustScore>(
    `/api/devices/${encodeURIComponent(ipAddress.trim())}/trust`,
    { signal },
  );
  return data;
}
