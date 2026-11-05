import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: 'skin-type' };

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="skin-type" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="budget" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
