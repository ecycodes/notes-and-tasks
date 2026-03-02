import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

/**
 * Singleton Supabase client.
 * Only created when credentials exist — avoids the "supabaseUrl is required" crash.
 * All store actions check `isSupabaseConfigured` before using this.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : // Dummy object that satisfies the type but never makes real calls.
    // TypeScript cast is safe here — all call sites are guarded by isSupabaseConfigured.
    (null as unknown as ReturnType<typeof createClient>);
