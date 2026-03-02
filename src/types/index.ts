/**
 * Global shared types.
 * Feature-specific types live in src/features/<feature>/types/
 * Only put types here that are used across 2+ features.
 */

export type Theme = "light" | "dark" | "system";

export type ID = string;

/** Generic API response wrapper — use when typing Supabase responses. */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
