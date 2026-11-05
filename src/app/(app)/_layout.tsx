import { Stack } from 'expo-router';

// Aquí se agregarán las pantallas fuera de las pestañas (detalle de producto, comparativa, modales)
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
