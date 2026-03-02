import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { AuthPage } from "@/features/auth/components/AuthPage";
import { DashboardPage } from "@/features/dashboard/components/DashboardPage";
import { NotesPage } from "@/features/notes/components/NotesPage";
import { TasksPage } from "@/features/tasks/components/TasksPage";
import { SettingsPage } from "@/features/auth/components/SettingsPage";
import { useAuthStore } from "@/features/auth/store/auth.store";

/**
 * App.tsx — router root + auth initialization.
 *
 * Route structure:
 *
 *   /auth          → AuthPage (public — login + register)
 *
 *   ProtectedRoute → guards everything below; redirects to /auth if no session
 *     AppShell     → persistent sidebar + layout shell
 *       /          → Dashboard
 *       /notes     → Notes (TipTap editor)
 *       /tasks     → Kanban board
 *       /settings  → Preferences
 *
 *   *              → Catch-all redirect to /
 *
 * Why `initialize()` in useEffect here?
 *   It runs once when the app mounts. Any deeper component can safely
 *   read `user` from useAuthStore() knowing it's already hydrated.
 *   We don't need to await it — ProtectedRoute shows a loader while
 *   `isLoading` is true, then re-renders once the session resolves.
 */
export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected routes — must be authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
