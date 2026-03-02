import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Task, TaskInsert, TaskUpdate, Status } from "../types";

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  fetchTasks: () => Promise<void>;
  createTask: (payload: Omit<TaskInsert, "user_id">) => Promise<void>;
  updateTask: (id: string, payload: TaskUpdate) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, status: Status) => Promise<void>;
  reorderTasks: (id: string, newPosition: number, status: Status) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("[tasks] fetchTasks error:", error);
      set({ error: error.message, isLoading: false });
      return;
    }

    set({ tasks: (data ?? []) as Task[], isLoading: false });
  },

  createTask: async (payload) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) { set({ error: "Not authenticated" }); return; }

    // Position: place at the end of its column
    const columnTasks = get().tasks.filter((t) => t.status === (payload.status ?? "todo"));
    const position = columnTasks.length;

    const insert: TaskInsert = {
      user_id: userId,
      title: payload.title,
      description: payload.description,
      tags: payload.tags ?? [],
      status: payload.status ?? "todo",
      priority: payload.priority ?? "medium",
      position,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(insert)
      .select()
      .single();

    if (error) { console.error("[tasks] createTask error:", error); set({ error: error.message }); return; }

    set((state) => ({ tasks: [...state.tasks, data as Task] }));
  },

  updateTask: async (id, payload) => {
    const { error } = await supabase
      .from("tasks")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) { set({ error: error.message }); return; }

    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...payload } : t)),
    }));
  },

  deleteTask: async (id) => {
    // Optimistic
    const previous = get().tasks;
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) { set({ tasks: previous, error: error.message }); }
  },

  moveTask: async (id, status) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    // Place at end of destination column
    const destTasks = get().tasks.filter((t) => t.status === status);
    const position = destTasks.length;

    // Optimistic
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status, position } : t)),
    }));

    const { error } = await supabase
      .from("tasks")
      .update({ status, position, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      // Rollback
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: task.status, position: task.position } : t)),
        error: error.message,
      }));
    }
  },

  reorderTasks: async (id, newPosition, status) => {
    const tasks = get().tasks;
    const columnTasks = tasks.filter((t) => t.status === status);
    const oldIndex = columnTasks.findIndex((t) => t.id === id);
    if (oldIndex === -1 || oldIndex === newPosition) return;

    // Build reordered column
    const reordered = [...columnTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newPosition, 0, moved);

    // Assign new position values
    const updated = reordered.map((t, i) => ({ ...t, position: i }));

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => {
        const u = updated.find((u) => u.id === t.id);
        return u ?? t;
      }),
    }));

    // Persist all affected positions
    await Promise.all(
      updated.map((t) =>
        supabase.from("tasks").update({ position: t.position }).eq("id", t.id)
      )
    );
  },
}));
