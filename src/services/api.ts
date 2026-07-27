import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type {
  Stats,
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
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://192.168.1.6:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ────────────────────────────────────────────────────────────
// Retry with exponential back-off
// ────────────────────────────────────────────────────────────
const MAX_RETRIES = 3;

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLast = attempt === retries;
      const axiosErr = err as AxiosError;
      // Don't retry on 4xx client errors
      if (axiosErr.response && axiosErr.response.status < 500) throw err;
      if (isLast) throw err;
      await new Promise((res) => setTimeout(res, 2 ** attempt * 500));
    }
  }
  throw new Error('Max retries exceeded');
}

// ────────────────────────────────────────────────────────────
// Sanitization helpers
// ────────────────────────────────────────────────────────────
const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;

export function validateIp(ip: string): boolean {
  return IP_REGEX.test(ip);
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
// Health
// ────────────────────────────────────────────────────────────
export async function getHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    await apiClient.get('/health', { signal } as AxiosRequestConfig);
    return true;
  } catch {
    return false;
  }
}

// ────────────────────────────────────────────────────────────
// Stats
// ────────────────────────────────────────────────────────────
export async function getStats(signal?: AbortSignal): Promise<Stats> {
  return withRetry(async () => {
    const { data } = await apiClient.get<Stats>('/api/stats/', { signal } as AxiosRequestConfig);
    // Ensure nested arrays exist
    return {
      total_logs: Number(data?.total_logs ?? 0),
      by_type: toArray<Stats['by_type'][number]>(data?.by_type),
      top_attackers: toArray<Stats['top_attackers'][number]>(data?.top_attackers),
      daily_activity: toArray<Stats['daily_activity'][number]>(data?.daily_activity),
      active_rules: Number(data?.active_rules ?? 0),
      total_devices: Number(data?.total_devices ?? 0),
    };
  });
}

// ────────────────────────────────────────────────────────────
// Logs
// ────────────────────────────────────────────────────────────
export async function getLogs(filters: LogFilters = {}, signal?: AbortSignal): Promise<Log[]> {
  return withRetry(async () => {
    const params: Record<string, string | number> = {
      limit: filters.limit ?? 50,
    };
    if (filters.log_type) params.log_type = filters.log_type;
    if (filters.src_ip) params.src_ip = filters.src_ip;
    const { data } = await apiClient.get<unknown>('/api/logs/', {
      params,
      signal,
    } as AxiosRequestConfig);
    return toArray<Log>(data);
  });
}

export async function getBlockedLogs(limit = 50, signal?: AbortSignal): Promise<Log[]> {
  return withRetry(async () => {
    const { data } = await apiClient.get<unknown>('/api/logs/blocked', {
      params: { limit },
      signal,
    } as AxiosRequestConfig);
    return toArray<Log>(data);
  });
}

export async function getAttackers(limit = 10, signal?: AbortSignal): Promise<Attacker[]> {
  return withRetry(async () => {
    const { data } = await apiClient.get<unknown>('/api/logs/attackers', {
      params: { limit },
      signal,
    } as AxiosRequestConfig);
    return toArray<Attacker>(data);
  });
}

// ────────────────────────────────────────────────────────────
// Rules
// ────────────────────────────────────────────────────────────
export async function getRules(signal?: AbortSignal): Promise<FirewallRule[]> {
  return withRetry(async () => {
    const { data } = await apiClient.get<unknown>('/api/rules/', {
      signal,
    } as AxiosRequestConfig);
    return toArray<FirewallRule>(data);
  });
}

export async function addRule(rule: RuleCreate): Promise<FirewallRule> {
  return withRetry(async () => {
    const payload: RuleCreate = {
      ...rule,
      rule_name: sanitizeString(rule.rule_name),
    };
    const { data } = await apiClient.post<FirewallRule>('/api/rules/', payload);
    return data;
  });
}

export async function deleteRule(ruleId: number): Promise<void> {
  return withRetry(async () => {
    await apiClient.delete(`/api/rules/${ruleId}`);
  });
}

export async function blockIp(srcIp: string): Promise<unknown> {
  if (!validateIp(srcIp)) throw new Error('Invalid IP address');
  return withRetry(async () => {
    const { data } = await apiClient.post('/api/rules/block-ip', null, {
      params: { src_ip: srcIp },
    });
    return data;
  });
}

// ────────────────────────────────────────────────────────────
// Devices
// ────────────────────────────────────────────────────────────
export async function getDevices(signal?: AbortSignal): Promise<Device[]> {
  return withRetry(async () => {
    const { data } = await apiClient.get<unknown>('/api/devices/', {
      signal,
    } as AxiosRequestConfig);
    return toArray<Device>(data);
  });
}

export async function registerDevice(device: DeviceRegister): Promise<Device> {
  return withRetry(async () => {
    const payload: DeviceRegister = {
      ...device,
      ip_address: device.ip_address.trim(),
      hostname: device.hostname ? sanitizeString(device.hostname) : undefined,
    };
    const { data } = await apiClient.post<Device>('/api/devices/register', payload);
    return data;
  });
}

export async function getDeviceTrust(ipAddress: string, signal?: AbortSignal): Promise<TrustScore> {
  if (!validateIp(ipAddress)) throw new Error('Invalid IP address');
  return withRetry(async () => {
    const { data } = await apiClient.get<TrustScore>(`/api/devices/${ipAddress}/trust`, {
      signal,
    } as AxiosRequestConfig);
    return data;
  });
}
