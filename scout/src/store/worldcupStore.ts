import { create } from 'zustand';
import type { WCMatchesFilter, WCPlayersFilter } from '../lib/worldcup/types';

interface MatchesState extends WCMatchesFilter {
  loading: boolean;
  setLoading: (v: boolean) => void;
  setStage: (s: string | null) => void;
  setGroup: (g: string | null) => void;
  setTeam: (t: number | null) => void;
  setStatus: (s: string | null) => void;
  setSearch: (q: string) => void;
  reset: () => void;
}

const matchInitial: WCMatchesFilter = {
  stage: null,
  group: null,
  team: null,
  status: null,
  search: '',
};

export const useWCMatchesStore = create<MatchesState>((set) => ({
  ...matchInitial,
  loading: false,
  setLoading: (v) => set({ loading: v }),
  setStage: (s) => set({ stage: s }),
  setGroup: (g) => set({ group: g }),
  setTeam: (t) => set({ team: t }),
  setStatus: (s) => set({ status: s }),
  setSearch: (q) => set({ search: q }),
  reset: () => set({ ...matchInitial }),
}));

interface PlayersState extends WCPlayersFilter {
  loading: boolean;
  setLoading: (v: boolean) => void;
  setPosition: (p: string | null) => void;
  setTeam: (t: number | null) => void;
  setAge: (min: number, max: number) => void;
  setSearch: (q: string) => void;
  setSort: (key: string) => void;
  reset: () => void;
}

const playerInitial: WCPlayersFilter = {
  position: null,
  team: null,
  ageMin: 16,
  ageMax: 45,
  search: '',
  sortBy: 'minutes_played',
  sortDir: 'desc',
};

export const useWCPlayersStore = create<PlayersState>((set) => ({
  ...playerInitial,
  loading: false,
  setLoading: (v) => set({ loading: v }),
  setPosition: (p) => set({ position: p }),
  setTeam: (t) => set({ team: t }),
  setAge: (min, max) => set({ ageMin: min, ageMax: max }),
  setSearch: (q) => set({ search: q }),
  setSort: (key) =>
    set((s) => {
      if (s.sortBy === key) return { sortDir: s.sortDir === 'desc' ? 'asc' : 'desc' };
      return { sortBy: key, sortDir: 'desc' };
    }),
  reset: () => set({ ...playerInitial }),
}));
