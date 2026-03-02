import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotesStore } from "../store/notes.store";
import type { Note } from "../types";

interface NoteListProps {
  onNewNote: () => void;
  onSelectNote?: () => void;
}

function formatNoteDate(isoString: string): string {
  const date = new Date(isoString);
  return date
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}


interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
}

function NoteItem({ note, isActive, onSelect }: NoteItemProps) {
  const preview = stripHtml(note.content);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      onClick={() => onSelect(note.id)}
      className={cn(
        "relative mx-3 mb-2 cursor-pointer transition-all duration-200",
        isActive
          ? "bg-white rounded-2xl shadow-lg px-4 py-4"
          : "bg-transparent px-4 py-4 hover:bg-white/50 rounded-2xl"
      )}
    >
      {/* Left purple pill — only when active */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-r-full" />
      )}

      {/* Title */}
      <p className="text-sm font-bold leading-snug mb-1 text-gray-900">
        {note.title || "Untitled"}
      </p>

      {/* Preview */}
      {preview && (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">
          {preview}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-gray-300">
          {formatNoteDate(note.updated_at)}
        </span>
      </div>
    </motion.div>
  );
}

export function NoteList({ onNewNote, onSelectNote }: NoteListProps) {
  const { notes, activeNoteId, isLoading, setActiveNote } = useNotesStore();
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          stripHtml(n.content).toLowerCase().includes(query.toLowerCase())
      )
    : notes;

  const sorted: Note[] = [
    ...filtered.filter((n) => n.is_starred),
    ...filtered.filter((n) => !n.is_starred),
  ];

  return (
    <div className="flex flex-col h-full bg-[#f5f4ff] shrink-0 border-r border-violet-100/60">

      {/* ── Search + New ── */}
      <div className="flex items-center gap-2 h-20 px-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className={cn(
                "w-full pl-9 pr-3 py-2 text-sm rounded-xl",
                "bg-white border border-violet-100/60",
                "text-gray-700 placeholder:text-gray-300",
                "outline-none focus:bg-white focus:border-violet-200 focus:ring-2 focus:ring-violet-100",
                "shadow-sm transition-all"
              )}
            />
          </div>
          <button
            onClick={onNewNote}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-xl shrink-0",
              "bg-violet-500 text-white shadow-md shadow-violet-200",
              "hover:bg-violet-600 transition-colors"
            )}
            aria-label="New note"
          >
            <Plus className="w-4 h-4" />
          </button>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse px-4 py-4 space-y-2"
              >
                <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
                <div className="h-2.5 bg-gray-50 rounded-full w-full" />
                <div className="h-2.5 bg-gray-50 rounded-full w-2/3" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-6 gap-2">
            <FileText className="w-6 h-6 text-gray-300" />
            <p className="text-xs text-gray-300">
              {query
                ? "No matching notes."
                : "No notes yet. Click + to start."}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {sorted.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isActive={activeNoteId === note.id}
                onSelect={(id) => { setActiveNote(id); onSelectNote?.(); }}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
