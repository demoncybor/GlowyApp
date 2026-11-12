import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, onlineManager, QueryClient, type Query } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { addFavorite, removeFavorite } from '@/services/favorites';

/** Cuánto tiempo se conservan en el dispositivo los datos guardados para usar la app sin conexión */
const OFFLINE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: OFFLINE_MAX_AGE, // debe ser al menos igual a maxAge para que la caché sobreviva al cerrar la app
    },
  },
});

export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  catalog: ['catalog'] as const,
  product: (id: string) => ['product', id] as const,
  favorites: (userId: string) => ['favorites', userId] as const,
  routine: (userId: string) => ['routine', userId] as const,
  photoUrls: (paths: string[]) => ['photo-urls', ...paths] as const,
};

export const mutationKeys = {
  toggleFavorite: ['favorites', 'toggle'] as const,
};

// Si se marca un favorito sin conexión, el cambio queda en cola (incluso si se cierra la app)
// y se envía al volver la red. Por eso su mutationFn vive aquí y no dentro del hook.
queryClient.setMutationDefaults(mutationKeys.toggleFavorite, {
  mutationFn: ({ productId, favorite }: { productId: string; favorite: boolean }) =>
    favorite ? addFavorite(productId) : removeFavorite(productId),
  scope: { id: 'favorites' }, // en orden: «agregar» y luego «quitar» no se cruzan
});

/** Guarda la caché de consultas en el dispositivo */
export const persistOptions = {
  persister: createAsyncStoragePersister({ storage: AsyncStorage }),
  maxAge: OFFLINE_MAX_AGE,
  buster: 'glowy-v1', // cambiarlo invalida la caché guardada si cambia la forma de los datos
  dehydrateOptions: {
    // Las URL firmadas de fotos vencen en una hora: no tiene caso guardarlas
    shouldDehydrateQuery: (q: Query) => q.state.status === 'success' && q.queryKey[0] !== 'photo-urls',
  },
};

// TanStack Query sabe si hay red (pausa consultas y cambios sin conexión) y si la app está en primer plano
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
);
AppState.addEventListener('change', (status) => focusManager.setFocused(status === 'active'));
