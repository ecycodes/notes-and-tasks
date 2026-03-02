import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AuthState, User, Session } from "../types";

interface AuthActions {
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

/**
 * useAuthStore — manages Supabase auth session globally.
 *
 * Key pattern — `initialize()`:
 *   Called ONCE at app startup (in App.tsx). It does two things:
 *   1. Reads the existing session from localStorage (Supabase persists it).
 *   2. Sets up `onAuthStateChange` listener so any future sign-in/sign-out
 *      (including magic links, OAuth callbacks, token refresh) automatically
 *      updates our store.
 *
 *   This means we never manually call getSession() in components — the store
 *   is always up to date and components just read `user` from the store.
 *
 * sign-in/sign-up return `string | null`:
 *   Returning the error message (not throwing) keeps error handling
 *   in the form component where it belongs — no try/catch needed there.
 */
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    // Skip Supabase calls entirely when credentials are not yet configured.
    // This lets the app render (showing AuthPage) without crashing.
    if (!isSupabaseConfigured) {
      set({ isLoading: false });
      return;
    }

    // Step 1: get current session (may exist from a previous visit)
    const { data } = await supabase.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user ?? null,
      isLoading: false,
    });

    // Step 2: subscribe to future auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
      });
    });
  },

  signUp: async (email, password) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message });
      return error.message;
    }
    // Email confirmation kapalıysa session direkt gelir
    if (data.session) {
      set({ user: data.user, session: data.session });
    }
    return null;
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      set({ error: error.message });
      return error.message;
    }
    // Direkt store'u güncelle — onAuthStateChange'i bekleme
    set({ user: data.user, session: data.session });
    return null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  setSession: (session) => {
    set({ session, user: (session?.user as User | undefined) ?? null });
  },
}));
