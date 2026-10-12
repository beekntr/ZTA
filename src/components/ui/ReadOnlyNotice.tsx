import React from 'react';
import { Lock } from 'lucide-react';
import { useIsAdmin } from '../../hooks/useAdmin';

/** Explains to visitors why the change buttons answer "admin key required". */
export const ReadOnlyNotice: React.FC = () => {
  const isAdmin = useIsAdmin();
  if (isAdmin) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-fg-2 shadow-card">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-text">
        <Lock className="h-3.5 w-3.5" />
      </span>
      <span>
        You're viewing a read-only demo. Adding rules, blocking IPs and registering devices need admin
        mode — use <span className="font-medium text-fg">Read-only</span> at the top right.
      </span>
    </div>
  );
};
