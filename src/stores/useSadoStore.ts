import { create } from 'zustand';

import { SadoSortKey, type Sado, type SadoFilterState, type Skin } from '@/types';

interface SadoStore {
    selectedSado: Sado | null;
    selectedSkin: Skin | null;
    searchTerm: string;
    filters: SadoFilterState;
    sortKey: SadoSortKey;
    sortAsc: boolean;

    setSelectedSado: (sado: Sado | null) => void;
    setSelectedSkin: (skin: Skin | null) => void;
    setSearchTerm: (term: string) => void;
    setFilters: (
        filters: SadoFilterState | ((prev: SadoFilterState) => SadoFilterState),
    ) => void;
    setSortKey: (key: SadoSortKey) => void;
    setSortAsc: (value: boolean | ((prev: boolean) => boolean)) => void;
    resetFilters: () => void;
}

export const useSadoStore = create<SadoStore>((set) => ({
    selectedSado: null,
    selectedSkin: null,
    searchTerm: '',
    filters: {
        personalities: [],
        races: [],
        stars: [],
    },
    sortKey: SadoSortKey.Name,
    sortAsc: true,

    setSelectedSado: (sado) =>
        set({
            selectedSado: sado,
            selectedSkin: sado?.skins?.[0] ?? null,
        }),

    setSelectedSkin: (skin) => set({ selectedSkin: skin }),

    setSearchTerm: (term) => set({ searchTerm: term }),

    setFilters: (filters) =>
        set((state) => ({
            filters: typeof filters === 'function' ? filters(state.filters) : filters,
        })),

    setSortKey: (key) => set({ sortKey: key }),

    setSortAsc: (value) =>
        set((state) => ({
            sortAsc: typeof value === 'function' ? value(state.sortAsc) : value,
        })),

    resetFilters: () =>
        set({
            filters: {
                personalities: [],
                races: [],
                stars: [],
            },
            searchTerm: '',
            sortKey: SadoSortKey.Name,
            sortAsc: true,
        }),
}));
