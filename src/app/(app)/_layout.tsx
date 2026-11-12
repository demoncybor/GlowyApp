import { Stack } from 'expo-router';

// Pestañas y, encima de ellas, las pantallas de detalle y los modales
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: '' }} />
      <Stack.Screen name="compare-pick" options={{ title: 'Elige otro producto' }} />
      <Stack.Screen name="compare" options={{ title: 'Comparativa' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Editar preferencias' }} />
      <Stack.Screen name="filters" options={{ title: 'Filtros', presentation: 'modal' }} />
      <Stack.Screen name="routine-add" options={{ title: 'Agregar a mi rutina', presentation: 'modal' }} />
    </Stack>
  );
}
