import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

type SessionState = {
  session: Session | null;
  /** false hasta que se restaura la sesión guardada en el dispositivo */
  initialized: boolean;
};

export const useSessionStore = create<SessionState>(() => ({ session: null, initialized: false }));

/** Restaura la sesión persistida y escucha cambios (login, logout, refresh). Llamar una vez al arrancar. */
export function startSessionListener() {
  supabase.auth.getSession().then(({ data }) => {
    useSessionStore.setState({ session: data.session, initialized: true });
  });
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    useSessionStore.setState({ session, initialized: true });
  });
  return () => data.subscription.unsubscribe();
}

export const useUserId = () => useSessionStore((s) => s.session?.user.id ?? null);
