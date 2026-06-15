import { create } from 'zustand';
import type { LeagueKey, PlayerFilters, PositionGroup, StatCategory } from '../lib/types';
import { AGE_CEIL, AGE_FLOOR } from '../lib/constants';

const DEFAULT_SORT: Record<StatCategory, string> = {
  general: 'rating',
  attacking: 'goals',
  creating: 'xa',
  defending: 'tackles',
};

interface FilterState extends PlayerFilters {
  loading: boolean;
  resultCount: number;
  setResultCount: (n: number) => void;
  setLoading: (v: boolean) => void;
  toggleLeague: (l: LeagueKey) => void;
  togglePosition: (p: PositionGroup) => void;
  setAge: (min: number, max: number) => void;
  setMinApps: (n: number) => void;
  setPer90: (v: boolean) => void;
  setSearch: (q: string) => void;
  setCategory: (c: StatCategory) => void;
  setSort: (key: string) => void;
  reset: () => void;
  hydrate: (partial: Partial<PlayerFilters>) => void;
}

const initial: PlayerFilters = {
  leagues: [],
  positions: [],
  ageMin: AGE_FLOOR,
  ageMax: AGE_CEIL,
  minApps: 5,
  per90: false,
  search: '',
  category: 'general',
  sortBy: 'rating',
  sortDir: 'desc',
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initial,
  loading: false,
  resultCount: 0,
  setResultCount: (n) => set({ resultCount: n }),
  setLoading: (v) => set({ loading: v }),
  toggleLeague: (l) =>
    set((s) => ({
      leagues: s.leagues.includes(l) ? s.leagues.filter((x) => x !== l) : [...s.leagues, l],
    })),
  togglePosition: (p) =>
    set((s) => ({
      positions: s.positions.includes(p)
        ? s.positions.filter((x) => x !== p)
        : [...s.positions, p],
    })),
  setAge: (min, max) => set({ ageMin: min, ageMax: max }),
  setMinApps: (n) => set({ minApps: n }),
  setPer90: (v) => set({ per90: v }),
  setSearch: (q) => set({ search: q }),
  setCategory: (c) =>
    set({ category: c, sortBy: DEFAULT_SORT[c], sortDir: 'desc' }),
  setSort: (key) =>
    set((s) => {
      if (s.sortBy === key) return { sortDir: s.sortDir === 'desc' ? 'asc' : 'desc' };
      return { sortBy: key, sortDir: 'desc' };
    }),
  reset: () => set({ ...initial }),
  hydrate: (partial) => set({ ...partial }),
}));
