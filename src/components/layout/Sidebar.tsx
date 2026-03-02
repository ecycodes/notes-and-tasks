import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Notes", to: "/notes", icon: FileText },
  { label: "Tasks", to: "/tasks", icon: CheckSquare },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 220 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative flex flex-col h-full shrink-0 overflow-hidden",
        "bg-white/70 backdrop-blur-2xl",
        "border-r border-white/60",
        "shadow-[4px_0_24px_rgba(0,0,0,0.04)]"
      )}
    >
      {/* ── Brand ── */}
      <div className="flex items-center h-20 px-5 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : -8 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            whileHover={{ rotate: 0, scale: 1.08 }}
            className={cn(
              "flex items-center justify-center shrink-0",
              "w-9 h-9 rounded-2xl",
              "bg-gradient-to-br from-violet-500 to-indigo-600",
              "shadow-lg shadow-violet-200"
            )}
          >
            <Brain className="w-[18px] h-[18px] text-white" />
          </motion.div>

          <motion.div
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            <p className="text-sm font-bold tracking-tight text-foreground">
              Second Brain
            </p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
              Your knowledge hub
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Section label ── */}
      <motion.p
        animate={{ opacity: isCollapsed ? 0 : 1 }}
        transition={{ duration: 0.15 }}
        className="px-5 pb-2 text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase"
      >
        Menu
      </motion.p>

      {/* ── Nav items ── */}
      <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar pt-2 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
          const isActive =
            to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to);

          return (
            <NavLink key={to} to={to} end={to === "/"}>
              <motion.div
                whileHover={{ x: isCollapsed ? 0 : 3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl",
                  "text-sm font-medium transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-all",
                    isActive
                      ? "bg-violet-100 text-violet-600"
                      : "bg-black/5 text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <motion.span
                  animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {label}
                </motion.span>

              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* ── Bottom ── */}
      <div className="px-3 pb-4 pt-2 space-y-0.5">
        {/* User card */}
        <div
          className="overflow-hidden mb-2 transition-all duration-300 ease-in-out"
          style={{ maxHeight: isCollapsed ? 0 : 80, opacity: isCollapsed ? 0 : 1 }}
        >
          <div className="px-3 py-2.5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100/80">
            <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">
              Signed in as
            </p>
            <p className="text-xs text-foreground font-medium truncate mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Settings */}
        <NavLink to="/settings">
          <motion.div
            whileHover={{ x: isCollapsed ? 0 : 3 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-2xl cursor-pointer",
              "text-sm font-medium transition-all duration-150",
              location.pathname === "/settings"
                ? "bg-gradient-to-r from-violet-500/15 to-indigo-500/10 text-violet-600"
                : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl shrink-0",
                location.pathname === "/settings"
                  ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-200 text-white"
                  : "bg-black/5 text-muted-foreground"
              )}
            >
              <Settings className="w-4 h-4" />
            </div>
            <motion.span
              animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
              transition={{ duration: 0.15 }}
              className="whitespace-nowrap overflow-hidden"
            >
              Settings
            </motion.span>
          </motion.div>
        </NavLink>

        {/* Sign out */}
        <motion.button
          whileHover={{ x: isCollapsed ? 0 : 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-3 px-2 py-2 rounded-2xl",
            "text-sm font-medium transition-all duration-150 cursor-pointer",
            "text-muted-foreground hover:bg-red-50 hover:text-red-500"
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0 bg-black/5">
            <LogOut className="w-4 h-4" />
          </div>
          <motion.span
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap overflow-hidden"
          >
            Sign out
          </motion.span>
        </motion.button>

        {/* Collapse toggle — hidden on tablet (rail is locked) */}
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-center py-2 px-2 rounded-2xl",
            "text-muted-foreground hover:bg-black/5 hover:text-foreground",
            "transition-colors text-xs font-medium gap-2",
            "md:hidden lg:flex"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
