import React, { useCallback, useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useIsAdmin } from '../../hooks/useAdmin';
import { errorMessage, setAdminKey, verifyAdminKey } from '../../services/api';

export const AdminButton: React.FC = () => {
  const isAdmin = useIsAdmin();
  const { success, info } = useToast();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');
  const [checking, setChecking] = useState(false);
  const [keyError, setKeyError] = useState('');

  const close = useCallback(() => {
    setOpen(false);
    setKey('');
    setKeyError('');
  }, []);

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setKeyError('');
    try {
      if (await verifyAdminKey(key.trim())) {
        setAdminKey(key.trim());
        success('Admin mode on', 'You can change rules and devices in this tab');
        close();
      } else {
        setKeyError('Wrong admin key');
      }
    } catch (err) {
      setKeyError(errorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  if (isAdmin) {
    return (
      <button
        onClick={() => {
          setAdminKey(null);
          info('Admin mode off', 'Back to read-only mode');
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-xs font-medium hover:bg-cyan-500/20 transition-colors"
        title="Leave admin mode"
      >
        <LockOpen className="w-3 h-3" />
        Admin
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-600/40 text-slate-400 bg-slate-800/30 text-xs font-medium hover:text-slate-200 hover:border-slate-500/60 transition-colors"
        title="Unlock admin mode"
      >
        <Lock className="w-3 h-3" />
        Read-only
      </button>
      <Modal isOpen={open} onClose={close} title="Unlock admin mode" maxWidth="max-w-sm">
        <form onSubmit={unlock} className="space-y-3">
          <p className="text-xs text-slate-500">
            This public dashboard is read-only. Enter the admin key to add rules, block IPs or
            register devices. The key is kept only for this browser tab.
          </p>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setKeyError('');
            }}
            placeholder="Admin key"
            className={`w-full px-3 py-2 rounded-lg bg-border/40 border text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono ${
              keyError ? 'border-red-500/60' : 'border-border'
            }`}
          />
          {keyError && <p className="text-xs text-red-400">{keyError}</p>}
          <Button
            type="submit"
            variant="primary"
            loading={checking}
            disabled={!key.trim()}
            icon={<LockOpen className="w-4 h-4" />}
            className="w-full justify-center"
          >
            Unlock
          </Button>
        </form>
      </Modal>
    </>
  );
};
