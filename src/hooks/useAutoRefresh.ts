import { useEffect, useRef } from 'react';

const MIN_INTERVAL_MS = 3_000;

/**
 * Generic auto-refresh hook. Calls `callback` every `intervalMs` milliseconds.
 * Enforces a minimum interval of 3 seconds to prevent API hammering.
 */
export function useAutoRefresh(callback: () => void, intervalMs: number, enabled = true) {
  const safeInterval = Math.max(intervalMs, MIN_INTERVAL_MS);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => callbackRef.current(), safeInterval);
    return () => clearInterval(id);
  }, [safeInterval, enabled]);
}
