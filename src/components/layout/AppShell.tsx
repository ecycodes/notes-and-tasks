import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

/** Returns true while the viewport matches the given media query. */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function AppShell() {
  // Desktop (lg+): user can manually toggle expand/collapse
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  // Mobile: sidebar overlay open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width: 767px)");   // < md
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)"); // md–lg

  // On tablet the rail is always collapsed; on desktop respect user toggle
  const isCollapsed = isTablet ? true : isDesktopCollapsed;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f3ff]">
      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──
          Mobile  (<md):  fixed overlay, slide in via isMobileOpen
          Tablet  (md–lg): always visible, icon-rail (collapsed=true)
          Desktop (lg+):  always visible, expand/collapse via toggle
      */}
      <div
        className={[
          "transition-transform duration-300 shrink-0",
          isMobile
            ? `fixed inset-y-0 left-0 z-40 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`
            : "static translate-x-0 z-auto",
        ].join(" ")}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => {
            if (isMobile) setIsMobileOpen(false);
            else if (!isTablet) setIsDesktopCollapsed((prev) => !prev);
          }}
        />
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar min-w-0">
        {/* Mobile-only top bar with hamburger */}
        <div className="flex items-center h-12 px-4 md:hidden shrink-0 bg-white/70 backdrop-blur border-b border-gray-100/60">
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
