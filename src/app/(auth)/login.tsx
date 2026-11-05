import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authErrorMessage, signIn } from '@/services/auth';

export default function LoginScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // al iniciar sesión, el layout raíz lleva al onboarding o a la app
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Te damos la bienvenida" subtitle="Entra para ver los productos que mejor van con tu piel.">
      <View style={styles.form}>
        <TextField
          label="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="tu@correo.com"
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          onSubmitEditing={canSubmit ? onSubmit : undefined}
        />
        {error && (
          <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
            {error}
          </ThemedText>
        )}
        <Button title="Entrar" onPress={onSubmit} disabled={!canSubmit} loading={loading} />
      </View>
      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          ¿No tienes cuenta?
        </ThemedText>
        <Link href="/register">
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            Crear cuenta
          </ThemedText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.three },
  footer: { flexDirection: 'row', gap: Spacing.two, justifyContent: 'center', alignItems: 'center' },
});
