/**
 * Glowy: componente raíz de la app.
 *
 * Este proyecto usa Expo Router, que arranca desde src/app/_layout.tsx (ver "main" en package.json).
 * Ese archivo solo reexporta este componente, así que aquí está todo lo que envuelve a la app:
 *   1. Proveedores globales: TanStack Query (datos del servidor, guardados en el dispositivo para usar
 *      la app sin conexión) y el tema claro/oscuro.
 *   2. Sesión: al abrir la app se restaura la sesión guardada en el dispositivo.
 *   3. Navegación: decide qué zona ve el usuario según su sesión y su perfil.
 *        - Sin sesión ................................. (auth)        login y registro
 *        - Con sesión y perfil incompleto ............. (onboarding)  tipo de piel, objetivos, presupuesto, preferencias
 *        - Con sesión y perfil completo ............... (app)         Para ti, Explorar, Rutina, Favoritos y Perfil
 */
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';

import { OfflineBanner } from '@/components/offline-banner';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { homeHref } from '@/lib/navigation';
import { persistOptions, queryClient } from '@/lib/query-client';
import { signOut } from '@/services/auth';
import { startSessionListener, useSessionStore } from '@/stores/session';

// Mantener el splash hasta saber si hay sesión
SplashScreen.preventAutoHideAsync();

export default function App() {
  const colorScheme = useColorScheme();

  useEffect(() => startSessionListener(), []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      // al restaurar la caché, enviar los cambios que quedaron en cola sin conexión
      onSuccess={() => queryClient.resumePausedMutations()}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <OfflineBanner />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}

// Decide qué zona ve el usuario: acceso, onboarding o la app
function RootNavigator() {
  const session = useSessionStore((s) => s.session);
  const initialized = useSessionStore((s) => s.initialized);
  const profile = useProfile();

  const signedIn = !!session;
  const ready = initialized && (!signedIn || !profile.isPending);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return <Loading />; // al arrancar lo tapa el splash; después de entrar, se ve el indicador

  if (signedIn && !profile.data) return <ProfileError onRetry={() => profile.refetch()} />;

  const onboarded = profile.data?.onboardingCompleted ?? false;
  const home = homeHref(signedIn, onboarded);

  // Cada grupo solo es accesible cuando su condición (guard) es verdadera;
  // si no lo es, redirectTo lleva al usuario a la pantalla que le corresponde
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!signedIn} redirectTo={home}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !onboarded} redirectTo={home}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && onboarded} redirectTo={home}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

function Loading() {
  const theme = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.primary} />
    </View>
  );
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ThemedText type="smallBold">No pudimos cargar tu perfil.</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
        Revisa tu conexión a internet e intenta de nuevo.
      </ThemedText>
      <Button title="Reintentar" onPress={onRetry} />
      <Button title="Cerrar sesión" variant="secondary" onPress={() => signOut().catch(() => {})} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
  centerText: { textAlign: 'center' },
});
