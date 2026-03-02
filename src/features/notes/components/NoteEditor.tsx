import { useEffect, useCallback, useRef, useState, type KeyboardEvent } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Code,
  Quote,
  Minus,
  Star,
  Trash2,
  FileText,
  X,
  Plus,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotesStore } from "../store/notes.store";

const AUTOSAVE_DELAY_MS = 1500;

// ── Toolbar button ────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, label, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "p-1.5 rounded-md transition-colors text-sm",
        isActive
          ? "bg-violet-100 text-violet-700 font-medium"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-700",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

// ── Tag system ────────────────────────────────────────────────────────────────

interface TagSystemProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

function TagSystem({ tags, onTagsChange }: TagSystemProps) {
  const [inputValue, setInputValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (value: string) => {
    const tag = value.trim();
    if (tag && !tags.includes(tag)) onTagsChange([...tags, tag]);
    setInputValue("");
    setIsAdding(false);
  };

  const removeTag = (tag: string) => onTagsChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(inputValue); }
    else if (e.key === "Escape") { setInputValue(""); setIsAdding(false); }
  };

  return (
    <div className="flex items-center flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200/60"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mr-0.5" />
          {tag}
          <button onClick={() => removeTag(tag)} className="hover:text-violet-900 ml-0.5">
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      {isAdding ? (
        <input
          ref={inputRef}
          autoFocus
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputValue.trim()) addTag(inputValue); else setIsAdding(false); }}
          placeholder="Tag name..."
          className="px-2 py-0.5 text-xs rounded-full border border-violet-300 bg-white text-gray-700 outline-none w-24 focus:border-violet-400"
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-400 border border-dashed border-gray-200 hover:border-violet-300 hover:text-violet-500 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Tag
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function NoteEditor() {
  const { activeNote, updateNote, deleteNote, toggleStar, updateTags, isSaving } = useNotesStore();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const scheduleAutoSave = useCallback(
    (id: string, content: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => void updateNote(id, { content }), AUTOSAVE_DELAY_MS);
    },
    [updateNote]
  );

  const handleSyncNow = async () => {
    if (!activeNote || isSyncing) return;
    setIsSyncing(true);
    await updateNote(activeNote.id, { content: editor?.getHTML() ?? activeNote.content });
    setIsSyncing(false);
  };

  const editor = useEditor({
    extensions: [StarterKit],
    content: activeNote?.content ?? "",
    editorProps: {
      attributes: {
        class: cn(
          "prose max-w-none outline-none min-h-[360px]",
          "[&_p]:text-[17px] [&_p]:text-gray-600 [&_p]:leading-[1.9] [&_p]:mb-4",
          "[&_h1]:text-gray-900 [&_h1]:font-bold [&_h1]:text-2xl [&_h1]:mb-3 [&_h1]:mt-6",
          "[&_h2]:text-gray-900 [&_h2]:font-semibold [&_h2]:text-xl [&_h2]:mb-2 [&_h2]:mt-5",
          "[&_h3]:text-gray-800 [&_h3]:font-semibold [&_h3]:text-base [&_h3]:mt-4",
          "[&_strong]:text-gray-800 [&_strong]:font-semibold",
          "[&_em]:text-gray-600",
          "[&_code]:bg-violet-50 [&_code]:text-violet-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono",
          "[&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-violet-300 [&_blockquote]:text-gray-500 [&_blockquote]:bg-violet-50/30 [&_blockquote]:py-2 [&_blockquote]:pr-4 [&_blockquote]:pl-4 [&_blockquote]:rounded-r-lg [&_blockquote]:my-4 [&_blockquote]:not-italic",
          "[&_hr]:border-gray-100 [&_hr]:my-6",
          "[&_li]:text-[17px] [&_li]:text-gray-600 [&_li]:leading-[1.9]",
          "[&_ul]:my-3 [&_ol]:my-3",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (!activeNote) return;
      scheduleAutoSave(activeNote.id, editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || !activeNote) return;
    if (editor.getHTML() !== activeNote.content) {
      editor.commands.setContent(activeNote.content, { emitUpdate: false });
    }
  }, [activeNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!activeNote) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-4"
        style={{
          backgroundColor: "#f8f8fc",
          backgroundImage: "radial-gradient(circle, #d1d5e0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
          <FileText className="w-6 h-6 text-gray-300" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-gray-500">No note selected</p>
          <p className="text-xs text-gray-300">Select a note or create a new one</p>
        </div>
      </div>
    );
  }

  // ── Editor ────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-full overflow-y-auto custom-scrollbar"
      style={{
        backgroundColor: "#f8f8fc",
        backgroundImage: "radial-gradient(circle, #d1d5e0 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* ── Top header: actions only ── */}
      <div className="flex items-center justify-end gap-1.5 px-4 md:px-8 h-14 md:h-16 shrink-0">
        <button
          onClick={() => void toggleStar(activeNote.id)}
          className={cn(
            "p-2 rounded-xl transition-all",
            activeNote.is_starred
              ? "text-amber-400"
              : "text-gray-400 hover:text-amber-400 hover:bg-white/70"
          )}
          aria-label={activeNote.is_starred ? "Unstar" : "Star"}
        >
          <Star className="w-4 h-4" fill={activeNote.is_starred ? "currentColor" : "none"} />
        </button>

        <button
          onClick={() => void deleteNote(activeNote.id)}
          className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/70 transition-all"
          aria-label="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => void handleSyncNow()}
          disabled={isSyncing || isSaving}
          className={cn(
            "ml-1 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase",
            "bg-violet-200/80 text-violet-700 hover:bg-violet-300/80 transition-colors shadow-sm",
            (isSyncing || isSaving) && "opacity-60 cursor-not-allowed"
          )}
        >
          <RefreshCw className={cn("w-3 h-3", (isSyncing || isSaving) && "animate-spin")} />
          {isSyncing || isSaving ? "Saving..." : "Sync Now"}
        </button>
      </div>

      {/* ── White editor card ── */}
      <div className="flex-1 mx-3 md:mx-6 mb-3 md:mb-6 bg-white rounded-[2rem] shadow-lg overflow-hidden flex flex-col">

        {/* Toolbar */}
        {editor && (
          <div className="flex items-center gap-0.5 px-6 py-3 border-b border-gray-100 shrink-0 flex-wrap">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} label="Bold">
              <Bold className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} label="Italic">
              <Italic className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} label="Strikethrough">
              <Strikethrough className="w-3.5 h-3.5" />
            </ToolbarButton>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} label="Heading 2">
              <Heading2 className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} label="Heading 3">
              <Heading3 className="w-3.5 h-3.5" />
            </ToolbarButton>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} label="Bullet list">
              <List className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} label="Ordered list">
              <ListOrdered className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} label="Code block">
              <Code className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} label="Blockquote">
              <Quote className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Horizontal rule">
              <Minus className="w-3.5 h-3.5" />
            </ToolbarButton>
          </div>
        )}

        {/* Document area — title + tags + body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-12 py-6 md:py-8">
          {/* Title */}
          <input
            key={activeNote.id}
            autoFocus
            type="text"
            defaultValue={activeNote.title}
            placeholder="Untitled"
            onBlur={(e) => {
              const newTitle = e.target.value.trim();
              if (newTitle !== activeNote.title) {
                void updateNote(activeNote.id, { title: newTitle || "Untitled" });
              }
            }}
            data-note-title
            className="w-full text-3xl font-bold text-gray-800 placeholder:text-gray-200 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none leading-tight mb-3"
          />

          {/* Tags */}
          <div className="mb-6">
            <TagSystem
              tags={activeNote.tags ?? []}
              onTagsChange={(tags) => void updateTags(activeNote.id, tags)}
            />
          </div>

          {/* Body */}
          <div className="[&_*]:outline-none [&_*]:shadow-none [&_*]:border-none">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
