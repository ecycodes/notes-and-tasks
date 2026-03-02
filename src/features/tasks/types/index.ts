export type Status = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  tags: string[];
  status: Status;
  priority: Priority;
  position: number; // for drag-and-drop ordering within a column
  created_at: string;
  updated_at: string;
}

export type TaskInsert = Pick<Task, "title" | "user_id"> &
  Partial<Pick<Task, "description" | "tags" | "status" | "priority" | "position">>;

export type TaskUpdate = Partial<
  Pick<Task, "title" | "description" | "tags" | "status" | "priority" | "position">
>;
