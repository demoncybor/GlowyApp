import { create } from 'zustand';

import { EMPTY_FILTERS, type CatalogFilters } from '@/lib/catalog-filters';

type FiltersState = CatalogFilters & {
  set: (patch: Partial<CatalogFilters>) => void;
  /** Quita los filtros; conserva la búsqueda y el orden */
  clear: () => void;
};

/** Filtros de Explorar; viven aquí para que sobrevivan al cerrar la hoja de filtros */
export const useFilters = create<FiltersState>((set) => ({
  ...EMPTY_FILTERS,
  set: (patch) => set(patch),
  clear: () => set({ category: null, priceMax: null, attributes: [] }),
}));
