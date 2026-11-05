import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authErrorMessage, signUp } from '@/services/auth';

const MIN_PASSWORD = 6;

export default function RegisterScreen() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.length >= MIN_PASSWORD;

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const { session } = await signUp(email.trim(), password, name.trim());
      // Si la confirmación de correo está activa, Supabase no devuelve sesión todavía
      if (!session) setNotice('Te enviamos un correo para confirmar tu cuenta. Después vuelve a entrar.');
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Crea tu cuenta" subtitle="Después te haremos unas preguntas rápidas sobre tu piel.">
      <View style={styles.form}>
        <TextField label="¿Cómo te llamas?" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
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
          label={`Contraseña (mínimo ${MIN_PASSWORD} caracteres)`}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
        {error && (
          <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
            {error}
          </ThemedText>
        )}
        {notice && (
          <ThemedText type="small" accessibilityRole="alert">
            {notice}
          </ThemedText>
        )}
        <Button title="Crear cuenta" onPress={onSubmit} disabled={!canSubmit} loading={loading} />
      </View>
      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          ¿Ya tienes cuenta?
        </ThemedText>
        <Link href="/login">
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            Entrar
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
