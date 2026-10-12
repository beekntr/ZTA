import { useSyncExternalStore } from 'react';
import { getAdminKey, subscribeAdminKey } from '../services/api';

/** True while this tab holds an admin key the server accepted. */
export function useIsAdmin(): boolean {
  return useSyncExternalStore(subscribeAdminKey, () => getAdminKey() !== null);
}
