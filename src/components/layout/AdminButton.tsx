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
        className="flex h-8 items-center gap-1.5 rounded-lg bg-accent-soft px-3 text-xs font-medium text-accent-text transition-colors hover:brightness-95"
        title="Leave admin mode"
      >
        <LockOpen className="h-3.5 w-3.5" />
        Admin
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
        title="Unlock admin mode"
      >
        <Lock className="h-3.5 w-3.5" />
        Read-only
      </button>
      <Modal isOpen={open} onClose={close} title="Unlock admin mode" maxWidth="max-w-sm">
        <form onSubmit={unlock} className="space-y-4">
          <p className="text-sm text-fg-2">
            This public dashboard is read-only. Enter the admin key to add rules, block IPs or register
            devices. The key is kept only for this browser tab.
          </p>
          <div>
            <label htmlFor="admin-key" className="field-label">
              Admin key
            </label>
            <input
              id="admin-key"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setKeyError('');
              }}
              aria-invalid={keyError ? true : undefined}
              className="field font-mono"
            />
            {keyError && <p className="field-error">{keyError}</p>}
          </div>
          <Button
            type="submit"
            variant="primary"
            loading={checking}
            disabled={!key.trim()}
            icon={<LockOpen className="h-4 w-4" />}
            className="w-full"
          >
            Unlock
          </Button>
        </form>
      </Modal>
    </>
  );
};
