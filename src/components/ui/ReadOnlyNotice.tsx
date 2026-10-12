import React from 'react';
import { Lock } from 'lucide-react';
import { useIsAdmin } from '../../hooks/useAdmin';

/** Explains to visitors why the change buttons answer "admin key required". */
export const ReadOnlyNotice: React.FC = () => {
  const isAdmin = useIsAdmin();
  if (isAdmin) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300/90">
      <Lock className="w-3.5 h-3.5 shrink-0" />
      <span>
        Public read-only demo. Adding rules, blocking IPs and registering devices need admin mode
        (button at the top right).
      </span>
    </div>
  );
};
