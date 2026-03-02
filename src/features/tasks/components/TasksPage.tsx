import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTasksStore } from "../store/tasks.store";
import type { Task, Status } from "../types";

// ── Column config ─────────────────────────────────────────────────────────────

const COLUMNS: { id: Status; label: string; dot: string; bg: string }[] = [
  { id: "todo",        label: "To Do",       dot: "bg-gray-400",    bg: "rgb(235 237 239 / 80%)" },
  { id: "in_progress", label: "In Progress",  dot: "bg-indigo-400",  bg: "rgb(226 231 248 / 80%)" },
  { id: "done",        label: "Done",         dot: "bg-emerald-400", bg: "rgb(225 245 235 / 80%)" },
];

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  low:    "bg-gray-100 text-gray-500",
  medium: "bg-amber-50 text-amber-600",
  high:   "bg-red-50 text-red-500",
};

// ── Sortable task card ─────────────────────────────────────────────────────────

 function SortableTaskCard({ task, onDelete, onMove }: {
  task: Task;
  onDelete: (id: string) => void;
  onMove: (id: string, status: Status) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const others = COLUMNS.filter((c) => c.id !== task.status);
  const isDone = task.status === "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white rounded-2xl p-4 mb-3 border border-gray-100/80 shadow-sm transition-all",
        isDragging ? "opacity-40 shadow-xl" : isDone ? "opacity-75 grayscale" : "opacity-100"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity touch-none"
            tabIndex={-1}
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <p className={cn(
            "text-sm font-semibold leading-snug",
            isDone ? "text-gray-500" : "text-gray-800"
          )}>
            {task.title}
          </p>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md text-gray-300 hover:text-red-400 transition-all shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 mt-1.5 ml-5 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-5">
          {task.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-500 font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 ml-5">
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", PRIORITY_COLORS[task.priority])}>
          {task.priority}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {others.map((col) => (
            <button
              key={col.id}
              onClick={() => onMove(task.id, col.id)}
              className="text-[10px] text-gray-400 hover:text-gray-700 px-1.5 py-0.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              → {col.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Kanban column ─────────────────────────────────────────────────────────────

function KanbanColumn({ column, tasks, onOpenDialog, onDelete, onMove }: {
  column: typeof COLUMNS[number];
  tasks: Task[];
  onOpenDialog: (status: Status) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: Status) => void;
}) {
  return (
    <div className="rounded-[2rem] p-5 flex flex-col" style={{ background: column.bg }}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", column.dot)} />
          <span className="text-sm font-bold text-gray-700">{column.label}</span>
          <span className="text-xs text-gray-400 font-semibold bg-white/60 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onOpenDialog(column.id)}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/70 hover:text-gray-700 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 min-h-[240px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <SortableTaskCard task={task} onDelete={onDelete} onMove={onMove} />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <p className="text-xs text-gray-300">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── New Task Dialog ────────────────────────────────────────────────────────────

function NewTaskDialog({ initialStatus, onClose }: {
  initialStatus: Status;
  onClose: () => void;
}) {
  const { createTask } = useTasksStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(initialStatus);
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const addTag = (value: string) => {
    const tag = value.trim();
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      tags,
      status,
      priority,
    });
    setSaving(false);
    // Only close if no error was set
    if (!useTasksStore.getState().error) onClose();
  };

  return (
    <>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
      />
      <motion.div
        key="dialog"
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
      >
        <div className="pointer-events-auto bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">New Task</h2>
              <p className="text-xs text-gray-400 mt-0.5">Add a new task to your board.</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleSubmit(); if (e.key === "Escape") onClose(); }}
                placeholder="What needs to be done?"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-100 text-gray-800 placeholder:text-gray-300 outline-none focus:border-violet-200 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Description <span className="normal-case font-normal text-gray-300">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more context..."
                rows={3}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-100 text-gray-800 placeholder:text-gray-300 outline-none focus:border-violet-200 focus:ring-2 focus:ring-violet-100 transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</label>
              <div className="flex gap-2">
                {COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setStatus(col.id)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                      status === col.id
                        ? "bg-violet-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    )}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Priority</label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all",
                      priority === p
                        ? PRIORITY_COLORS[p] + " ring-2 ring-offset-1 ring-current"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tags</label>
              <div className="flex flex-wrap gap-1.5 min-h-[32px] px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 focus-within:border-violet-200 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-violet-900">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
                    if (e.key === "Backspace" && !tagInput && tags.length > 0) removeTag(tags[tags.length - 1]);
                  }}
                  placeholder={tags.length === 0 ? "Add tags..." : ""}
                  className="flex-1 min-w-[80px] text-xs text-gray-700 bg-transparent outline-none placeholder:text-gray-300"
                />
              </div>
              <p className="text-[10px] text-gray-300">Press Enter or comma to add a tag</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => void handleSubmit()} disabled={!title.trim() || saving} className="flex-1 py-2.5 text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 rounded-xl transition-colors disabled:opacity-40">
                {saving ? "Saving..." : "Save Task"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function TasksPage() {
  const { tasks, isLoading, fetchTasks, deleteTask, moveTask, reorderTasks } = useTasksStore();
  const [search, setSearch] = useState("");
  const [dialogStatus, setDialogStatus] = useState<Status | null>(null);

  useEffect(() => { void fetchTasks(); }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overTask = tasks.find((t) => t.id === over.id);
    if (!activeTask || !overTask || activeTask.status !== overTask.status) return;

    const columnTasks = tasks
      .filter((t) => t.status === activeTask.status)
      .sort((a, b) => a.position - b.position);

    const newIndex = columnTasks.findIndex((t) => t.id === over.id);
    void reorderTasks(activeTask.id, newIndex, activeTask.status);
  };

  const filtered = search.trim()
    ? tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  // Sort each column by position
  const sorted = [...filtered].sort((a, b) => a.position - b.position);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-[#f8f8fc] overflow-hidden">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between px-4 md:px-10 pt-6 md:pt-8 pb-6 gap-4 shrink-0">
          <div>
            <h1 className="text-2xl md:text-[1.75rem] lg:text-3xl font-extrabold tracking-tight text-gray-900 leading-none">
              Flow State
            </h1>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase mt-1.5">
              Master your productivity
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a task..."
                className="pl-9 pr-4 py-2 text-sm rounded-full bg-white/80 border border-gray-200/60 text-gray-600 placeholder:text-gray-300 outline-none focus:border-violet-200 focus:ring-2 focus:ring-violet-100 shadow-sm w-36 sm:w-48 transition-all"
              />
            </div>
            <button
              onClick={() => setDialogStatus("todo")}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-violet-200/80 text-violet-700 font-bold text-sm tracking-wide hover:bg-violet-300/80 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Mission</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* ── Board ── */}
        {/* Mobile + Tablet (<lg): single column stack; Desktop (lg+): 3-col grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 pb-8">
          {isLoading ? (
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
              {COLUMNS.map((col) => (
                <div
                  key={col.id}
                  className="rounded-[2rem] p-5"
                  style={{ background: col.bg }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className={cn("w-2 h-2 rounded-full", col.dot)} />
                    <div className="h-3 w-16 bg-white/60 rounded-full animate-pulse" />
                  </div>
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white/60 rounded-2xl p-4 mb-3 animate-pulse space-y-2">
                      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                      <div className="h-2.5 bg-gray-50 rounded-full w-full" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={sorted.filter((t) => t.status === col.id)}
                  onOpenDialog={setDialogStatus}
                  onDelete={(id) => void deleteTask(id)}
                  onMove={(id, status) => void moveTask(id, status)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── New Task Dialog ── */}
        <AnimatePresence>
          {dialogStatus !== null && (
            <NewTaskDialog
              key="new-task-dialog"
              initialStatus={dialogStatus}
              onClose={() => setDialogStatus(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}
