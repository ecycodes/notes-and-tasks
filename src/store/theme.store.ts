import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "@/types";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/**
 * ThemeStore — manages light/dark/system preference.
 *
 * Why Zustand + persist middleware?
 *   - persist saves the choice to localStorage automatically.
 *   - On next visit, the user's preference is restored before React hydrates,
 *     preventing a flash of the wrong theme.
 *
 * The applyTheme() call is the bridge between JS state and the CSS class
 * strategy defined in tailwind.config.js (darkMode: ["class"]).
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    // system: follow OS preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    { name: "second-brain-theme" }
  )
);

/** Call once at app startup to apply the persisted theme before first render. */
export function initTheme() {
  const stored = localStorage.getItem("second-brain-theme");
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { state?: { theme?: Theme } };
      const theme = parsed?.state?.theme ?? "light";
      applyTheme(theme);
    } catch {
      applyTheme("light");
    }
  }
}
