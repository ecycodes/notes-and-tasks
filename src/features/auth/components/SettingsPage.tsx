import { motion } from "framer-motion";
import { Moon, Sun, Monitor, LogOut } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { useAuthStore } from "../store/auth.store";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types";

interface ThemeOptionProps {
  value: Theme;
  label: string;
  icon: React.ElementType;
  current: Theme;
  onSelect: (t: Theme) => void;
}

function ThemeOption({ value, label, icon: Icon, current, onSelect }: ThemeOptionProps) {
  const isActive = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all",
        isActive
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { user, signOut } = useAuthStore();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences.</p>
      </motion.div>

      {/* Account */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-card border border-border rounded-xl p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-foreground">Account</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Signed in</p>
          </div>
          <button
            onClick={() => void signOut()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border border-border hover:border-destructive/30"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-5 space-y-4"
      >
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          <p className="text-xs text-muted-foreground">Choose your preferred color theme.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <ThemeOption value="light" label="Light" icon={Sun} current={theme} onSelect={setTheme} />
          <ThemeOption value="dark" label="Dark" icon={Moon} current={theme} onSelect={setTheme} />
          <ThemeOption value="system" label="System" icon={Monitor} current={theme} onSelect={setTheme} />
        </div>
      </motion.div>
    </div>
  );
}
