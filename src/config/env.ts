/**
 * Centralized env config — single place to validate & access env vars.
 * Vite exposes only VITE_* prefixed vars to the client bundle.
 * Throwing early on startup beats a cryptic runtime error later.
 */
// Validation is skipped until Supabase credentials are added to .env.
// Once you fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY,
// uncomment the block below to get early startup errors on missing vars.
//
// const requiredVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"] as const;
// for (const key of requiredVars) {
//   if (!import.meta.env[key]) throw new Error(`Missing env var: ${key}`);
// }

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
} as const;
