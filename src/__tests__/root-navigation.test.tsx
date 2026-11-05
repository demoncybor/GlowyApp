// Comprueba que las zonas protegidas de App.tsx llevan a cada usuario a la pantalla correcta.
// Usa pantallas simuladas con la misma estructura de rutas que src/app/.
import { Stack } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { create } from 'zustand';

import { homeHref } from '@/lib/navigation';

type AuthState = { signedIn: boolean; onboarded: boolean };
const useAuth = create<AuthState>(() => ({ signedIn: false, onboarded: false }));
const setAuth = (s: AuthState) => useAuth.setState(s);

function RootLayout() {
  const { signedIn, onboarded } = useAuth();
  const home = homeHref(signedIn, onboarded);
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

const routes = (initial: AuthState) => {
  setAuth(initial);
  return {
    _layout: RootLayout,
    '(auth)/_layout': { default: () => <Stack />, unstable_settings: { initialRouteName: 'login' } },
    '(auth)/login': () => <Text>login</Text>,
    '(auth)/register': () => <Text>register</Text>,
    '(onboarding)/_layout': { default: () => <Stack />, unstable_settings: { initialRouteName: 'skin-type' } },
    '(onboarding)/skin-type': () => <Text>skin-type</Text>,
    '(onboarding)/goals': () => <Text>goals</Text>,
    '(app)/_layout': () => <Stack />,
    '(app)/(tabs)/_layout': () => <Stack />,
    '(app)/(tabs)/index': () => <Text>para-ti</Text>,
    '(app)/(tabs)/profile': () => <Text>perfil</Text>,
  };
};

describe('al abrir la app', () => {
  it.each([
    [{ signedIn: false, onboarded: false }, 'login'],
    [{ signedIn: true, onboarded: false }, 'skin-type'],
    [{ signedIn: true, onboarded: true }, 'para-ti'],
  ])('%o abre %s', async (initial, expected) => {
    await renderRouter(routes(initial), { initialUrl: '/' });
    expect(screen.getByText(expected)).toBeTruthy();
  });
});

it('lleva al usuario a la pantalla correcta cuando cambia su estado', async () => {
  await renderRouter(routes({ signedIn: false, onboarded: false }), { initialUrl: '/' });
  expect(screen.getByText('login')).toBeTruthy();

  await act(() => setAuth({ signedIn: true, onboarded: false })); // crea cuenta o inicia sesión
  expect(screen.getByText('skin-type')).toBeTruthy();

  await act(() => setAuth({ signedIn: true, onboarded: true })); // termina el onboarding
  expect(screen.getByText('para-ti')).toBeTruthy();

  await act(() => setAuth({ signedIn: false, onboarded: false })); // cierra sesión
  expect(screen.getByText('login')).toBeTruthy();
});
