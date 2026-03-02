/**
 * Note types — mirrors the Supabase `notes` table schema.
 */

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string; // TipTap outputs HTML string
  is_starred: boolean;
  tags: string[]; // array of tag labels, stored as text[] in Supabase
  created_at: string; // ISO 8601 from Supabase
  updated_at: string;
}

/** Shape sent to Supabase on INSERT */
export type NoteInsert = Pick<Note, "title" | "content" | "user_id">;

/** Shape sent to Supabase on UPDATE — all fields optional */
export type NoteUpdate = Partial<Pick<Note, "title" | "content" | "is_starred" | "tags">>;
