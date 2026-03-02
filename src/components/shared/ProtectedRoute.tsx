import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";

/**
 * ProtectedRoute — guards all authenticated pages.
 *
 * Pattern: renders <Outlet /> (the child route) when logged in,
 * redirects to /auth when not. `replace` prevents the auth page
 * from appearing in the browser history — pressing Back won't
 * loop the user back to /auth after signing in.
 *
 * Why check `isLoading`?
 *   On first render, `initialize()` in App.tsx is async. There's a brief
 *   moment where `user` is null but we haven't confirmed it yet.
 *   Without this guard, authenticated users see a flash-redirect to /auth.
 *   The spinner holds the screen until the session check resolves.
 */
export function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary animate-pulse" />
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth" replace />;
}
