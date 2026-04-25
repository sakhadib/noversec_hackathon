"use client";

import { create } from "zustand";

type AuthState = {
  hasHydrated: boolean;
  isAuthenticated: boolean;
  email: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
  hydrate: () => void;
};

const AUTH_KEY = "strugglemap-auth";

export const useAuthStore = create<AuthState>((set) => ({
  hasHydrated: false,
  isAuthenticated: false,
  email: null,
  signIn: (email) => {
    const authData = { email, isAuthenticated: true };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    set({ ...authData, hasHydrated: true });
  },
  signOut: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ isAuthenticated: false, email: null, hasHydrated: true });
  },
  hydrate: () => {
    set((state) => {
      if (state.hasHydrated) {
        return state;
      }

      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) {
        return { ...state, hasHydrated: true };
      }

      try {
        const parsed = JSON.parse(raw) as { email: string; isAuthenticated: boolean };
        return {
          ...state,
          hasHydrated: true,
          isAuthenticated: parsed.isAuthenticated,
          email: parsed.email,
        };
      } catch {
        return { ...state, hasHydrated: true, isAuthenticated: false, email: null };
      }
    });
  },
}));
