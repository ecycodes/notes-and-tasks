import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Note, NoteInsert, NoteUpdate } from "../types";

interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Derived — avoids redundant find() calls in components
  activeNote: Note | null;

  // Actions
  fetchNotes: () => Promise<void>;
  createNote: (payload: Omit<NoteInsert, "user_id">) => Promise<Note | null>;
  updateNote: (id: string, payload: NoteUpdate) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  updateTags: (id: string, tags: string[]) => Promise<void>;
  setActiveNote: (id: string | null) => void;
}

/**
 * useNotesStore — single source of truth for notes feature.
 *
 * Architecture decisions:
 *
 * 1. Optimistic updates on delete:
 *    We remove the note from local state immediately, then call Supabase.
 *    If Supabase fails, we re-fetch to restore truth. This keeps the UI
 *    feeling instant even on slow connections.
 *
 * 2. Auto-save pattern for updates:
 *    `updateNote` is called by the editor's onUpdate callback (debounced
 *    in the component). The store sets isSaving=true so the UI can show
 *    a subtle "Saving..." indicator without blocking input.
 *
 * 3. activeNote as derived state:
 *    Computed from notes[] + activeNoteId inside the setter.
 *    This avoids a separate selector and keeps components simple:
 *    just `const { activeNote } = useNotesStore()`.
 *
 * 4. user_id handling:
 *    We get the session inside the store action rather than passing it
 *    as a parameter. This keeps the API surface clean — components
 *    don't need to know about auth to create a note.
 *
 * 5. toggleStar: optimistic update — flip locally, then persist.
 *    Rollback on error to keep UI consistent with server state.
 */
export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  activeNoteId: null,
  activeNote: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }

    const notes = (data ?? []) as Note[];
    set({ notes, isLoading: false });
  },

  createNote: async (payload) => {
    // Get current user — needed for the user_id FK
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      set({ error: "Not authenticated" });
      return null;
    }

    const insert: NoteInsert = { ...payload, user_id: userId };

    const { data, error } = await supabase
      .from("notes")
      .insert(insert)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    const newNote = data as Note;

    // Prepend to list (newest first) and activate immediately
    set((state) => ({
      notes: [newNote, ...state.notes],
      activeNoteId: newNote.id,
      activeNote: newNote,
    }));

    return newNote;
  },

  updateNote: async (id, payload) => {
    set({ isSaving: true });

    const { data, error } = await supabase
      .from("notes")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      set({ error: error.message, isSaving: false });
      return;
    }

    const updated = data as Note;

    set((state) => ({
      isSaving: false,
      notes: state.notes.map((n) => (n.id === id ? updated : n)),
      // Keep activeNote in sync if this is the currently open note
      activeNote: state.activeNoteId === id ? updated : state.activeNote,
    }));
  },

  deleteNote: async (id) => {
    // Optimistic: remove from UI immediately
    const previousNotes = get().notes;
    const nextActiveId =
      get().activeNoteId === id
        ? (previousNotes.find((n) => n.id !== id)?.id ?? null)
        : get().activeNoteId;

    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      activeNoteId: nextActiveId,
      activeNote: nextActiveId
        ? (state.notes.find((n) => n.id === nextActiveId) ?? null)
        : null,
    }));

    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      // Rollback on failure
      set({ notes: previousNotes, error: error.message });
    }
  },

  toggleStar: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;

    const newStarred = !note.is_starred;

    // Optimistic update
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, is_starred: newStarred } : n
      ),
      activeNote:
        state.activeNoteId === id
          ? { ...state.activeNote!, is_starred: newStarred }
          : state.activeNote,
    }));

    const { error } = await supabase
      .from("notes")
      .update({ is_starred: newStarred })
      .eq("id", id);

    if (error) {
      // Rollback
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, is_starred: note.is_starred } : n
        ),
        activeNote:
          state.activeNoteId === id
            ? { ...state.activeNote!, is_starred: note.is_starred }
            : state.activeNote,
        error: error.message,
      }));
    }
  },

  updateTags: async (id, tags) => {
    // Optimistic update
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, tags } : n)),
      activeNote:
        state.activeNoteId === id
          ? { ...state.activeNote!, tags }
          : state.activeNote,
    }));

    const { error } = await supabase
      .from("notes")
      .update({ tags })
      .eq("id", id);

    if (error) {
      set({ error: error.message });
    }
  },

  setActiveNote: (id) => {
    const note = id ? get().notes.find((n) => n.id === id) ?? null : null;
    set({ activeNoteId: id, activeNote: note });
  },
}));
