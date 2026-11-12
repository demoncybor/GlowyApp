import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authErrorMessage, confirmPasswordReset, requestPasswordReset } from '@/services/auth';

const MIN_PASSWORD = 6;
const CODE_LENGTH = 6;

// Dos pasos: 1) pedir el código por correo, 2) escribir el código y la contraseña nueva
export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(action: () => Promise<void>) {
    setError(null);
    setLoading(true);
    try {
      await action();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  const sendCode = () =>
    run(async () => {
      await requestPasswordReset(email.trim());
      setStep('code');
    });

  // Al confirmar, el usuario queda con sesión iniciada y App.tsx lo lleva a su pantalla de inicio
  const confirm = () => run(() => confirmPasswordReset(email.trim(), code.trim(), password));

  const errorText = error && (
    <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
      {error}
    </ThemedText>
  );

  if (step === 'email') {
    return (
      <Screen title="Recupera tu contraseña" subtitle="Te enviaremos un código de 6 dígitos a tu correo.">
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
          {errorText}
          <Button title="Enviar código" onPress={sendCode} disabled={!email.trim()} loading={loading} />
          <Button title="Volver" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Revisa tu correo" subtitle={`Escribe el código que enviamos a ${email.trim()} y elige una contraseña nueva.`}>
      <View style={styles.form}>
        <TextField
          label="Código"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          placeholder="123456"
        />
        <TextField
          label={`Contraseña nueva (mínimo ${MIN_PASSWORD} caracteres)`}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
        {errorText}
        <Button
          title="Guardar contraseña"
          onPress={confirm}
          disabled={code.length !== CODE_LENGTH || password.length < MIN_PASSWORD}
          loading={loading}
        />
        <Button title="Enviar otro código" variant="secondary" onPress={sendCode} disabled={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.three },
});
