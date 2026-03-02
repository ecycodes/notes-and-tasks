import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useNotesStore } from "../store/notes.store";
import { NoteList } from "./NoteList";
import { NoteEditor } from "./NoteEditor";

export function NotesPage() {
  const { fetchNotes, createNote, activeNoteId } = useNotesStore();
  // Mobile only: toggle between list and editor views
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const handleNewNote = async () => {
    await createNote({ title: "", content: "" });
    setShowEditor(true);
  };

  const handleSelectNote = () => {
    setShowEditor(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex h-[calc(100vh-3rem)] md:h-screen"
    >
      {/* ── Note list ──
          Mobile (<md):  full-width, hidden when editor is active
          Tablet (md–lg): w-1/3, always visible alongside editor
          Desktop (lg+): fixed 320px column
      */}
      <div
        className={[
          "shrink-0 md:w-1/3 lg:w-[320px]",
          // Mobile: full width when showing list, hidden when editor is active
          showEditor && activeNoteId
            ? "hidden md:flex md:flex-col"
            : "flex flex-col w-full",
        ].join(" ")}
      >
        <NoteList
          onNewNote={() => void handleNewNote()}
          onSelectNote={handleSelectNote}
        />
      </div>

      {/* ── Editor ──
          Mobile (<md):  full-width, shown only when a note is selected
          Tablet (md+):  flex-1, always visible
      */}
      <div
        className={[
          "flex-1 min-w-0 flex flex-col",
          showEditor && activeNoteId ? "flex" : "hidden md:flex",
        ].join(" ")}
      >
        {/* Back button — mobile only */}
        {showEditor && activeNoteId && (
          <button
            onClick={() => setShowEditor(false)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-violet-600 md:hidden shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            Notes
          </button>
        )}
        <div className="flex-1 min-h-0">
          <NoteEditor />
        </div>
      </div>
    </motion.div>
  );
}
