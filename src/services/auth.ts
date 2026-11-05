import type { AuthError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Mensaje en español para los errores de Auth más comunes */
export function authErrorMessage(error: unknown): string {
  const code = (error as AuthError | undefined)?.code;
  switch (code) {
    case 'invalid_credentials':
      return 'Correo o contraseña incorrectos.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Ya existe una cuenta con ese correo.';
    case 'weak_password':
      return 'La contraseña es muy débil: usa al menos 6 caracteres.';
    case 'validation_failed':
    case 'email_address_invalid':
      return 'Revisa que el correo esté bien escrito.';
    case 'email_not_confirmed':
      return 'Confirma tu correo antes de entrar.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Demasiados intentos. Espera un momento y vuelve a intentar.';
    default:
      return 'No se pudo conectar. Revisa tu conexión e intenta de nuevo.';
  }
}
