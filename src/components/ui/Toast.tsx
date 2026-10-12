import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ────────────────────────────────────────────────────────────
// Context
// ────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ────────────────────────────────────────────────────────────
// Toast item styles (the icon carries the status, next to its title)
// ────────────────────────────────────────────────────────────
const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-good" />,
  error: <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-critical" />,
  warning: <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />,
  info: <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" />,
};

// ────────────────────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
      setTimeout(() => remove(id), 4_000);
    },
    [remove],
  );

  const success = useCallback(
    (title: string, message?: string) => toast({ type: 'success', title, message }),
    [toast],
  );
  const error = useCallback(
    (title: string, message?: string) => toast({ type: 'error', title, message }),
    [toast],
  );
  const warning = useCallback(
    (title: string, message?: string) => toast({ type: 'warning', title, message }),
    [toast],
  );
  const info = useCallback(
    (title: string, message?: string) => toast({ type: 'info', title, message }),
    [toast],
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast container */}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-pop animate-slide-in"
          >
            {ICON_MAP[t.type]}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">{t.title}</p>
              {t.message && <p className="mt-0.5 text-xs text-fg-2">{t.message}</p>}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="grid h-6 w-6 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
