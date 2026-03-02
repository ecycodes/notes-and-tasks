import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "../store/auth.store";

/* ── Validation schemas ── */

const authSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

type AuthMode = "login" | "register";

/* ── Sub-components ── */

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm<AuthFormValues>>["register"]>;
}

function FormField({
  id,
  label,
  type = "text",
  placeholder,
  error,
  registration,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          {...registration}
          className={cn(
            "w-full px-3 py-2.5 text-sm rounded-lg",
            "bg-background border border-input",
            "text-foreground placeholder:text-muted-foreground/50",
            "outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
            "transition-shadow",
            isPassword && "pr-10",
            error && "border-destructive focus:ring-destructive"
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main component ── */

/**
 * AuthPage — login and register in a single component, toggled by `mode`.
 *
 * Why one component instead of two separate pages?
 *   The forms are identical (email + password). Sharing one component
 *   and toggling mode avoids duplicating form logic, validation schema,
 *   and layout. The mode switch animates with Framer Motion for polish.
 *
 * The `register` suffix note:
 *   Supabase by default sends a confirmation email on sign-up.
 *   In development you can disable this in: Supabase Dashboard →
 *   Authentication → Email → "Enable email confirmations" → off.
 */
export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signIn, signUp, user } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });

  // Giriş yapıldıysa direkt dashboard'a yönlendir (tüm hook'lardan sonra)
  if (user) return <Navigate to="/" replace />;

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setServerError(null);
    setSuccessMessage(null);
    reset();
  };

  const onSubmit = async (values: AuthFormValues) => {
    console.log("onSubmit called, mode:", mode, "email:", values.email);
    setServerError(null);
    setSuccessMessage(null);

    if (mode === "login") {
      const error = await signIn(values.email, values.password);
      console.log("signIn result error:", error);
      if (error) {
        console.error("Sign in error:", error);
        setServerError(error);
      }
      // On success, the auth store listener updates `user` →
      // the protected route in App.tsx redirects automatically.
    } else {
      const error = await signUp(values.email, values.password);
      if (error) {
        setServerError(error);
      } else {
        setSuccessMessage(
          "Account created! Check your email to confirm your address, then sign in."
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Second Brain
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mode === "login"
                ? "Welcome back. Sign in to continue."
                : "Create your account to get started."}
            </p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4"
        >
          {/* Tab switcher */}
          <div className="flex p-1 bg-muted rounded-lg">
            {(["login", "register"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => switchMode(tab)}
                className={cn(
                  "flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-150",
                  mode === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              registration={register("email")}
            />
            <FormField
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              registration={register("password")}
            />

            {/* Server-level errors */}
            <AnimatePresence mode="wait">
              {serverError && (
                <motion.p
                  key="server-error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                >
                  {serverError}
                </motion.p>
              )}
              {successMessage && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2"
                >
                  {successMessage}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "py-2.5 text-sm font-medium rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
