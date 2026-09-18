import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, homeForRoles } from "@/lib/auth";
import { RESTAURANT } from "@/lib/restaurant";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login & Register — RK Silver Spoon" },
      {
        name: "description",
        content:
          "Sign in to order food, reserve a table and track your order at RK Silver Spoon. Staff, kitchen and owner accounts sign in here too.",
      },
      { property: "og:title", content: "Login & Register — RK Silver Spoon" },
      { property: "og:description", content: "Sign in to order, reserve and track your order." },
    ],
  }),
  component: AuthPage,
});

const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(80),
    mobile: z.string().trim().min(8, "Enter a valid mobile number").max(20),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z.string().min(6, "Password must be at least 6 characters").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

type Mode = "login" | "register" | "forgot";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    password: "",
    confirm: "",
  });
  const navigate = useNavigate();
  const { session, roles, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) navigate({ to: homeForRoles(roles), replace: true });
  }, [loading, session, roles, navigate]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      } else if (mode === "register") {
        const parsed = registerSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: form.full_name.trim(), mobile: form.mobile.trim() },
          },
        });
        if (error) throw error;
        toast.success("Account created. You can start ordering!");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent to your email.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
      <div className="hidden lg:block">
        <p className="eyebrow">Members</p>
        <h1 className="mt-2 font-display text-4xl gold-text">{RESTAURANT.name}</h1>
        <p className="text-xs tracking-[0.3em] text-muted-foreground">{RESTAURANT.tagline}</p>
        <img
          src="/images/biryani.jpg"
          alt="Signature biryani"
          loading="lazy"
          className="mt-8 rounded-xl border border-border object-cover"
        />
        <p className="mt-6 text-sm text-muted-foreground">
          One account for everything — order parcel or dine-in, reserve tables, and track your order
          live. Owner, staff and kitchen accounts use this same login and are taken straight to their
          dashboard.
        </p>
      </div>

      <div className="card-elevated p-6 sm:p-8">
        <div className="mb-6 flex gap-2">
          {(["login", "register"] as const).map((m) => (
            <Button
              key={m}
              variant={mode === m ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(m)}
            >
              {m === "login" ? "Login" : "Register"}
            </Button>
          ))}
        </div>

        <h2 className="font-display text-3xl">
          {mode === "login" ? "Welcome back" : mode === "register" ? "Create your account" : "Reset password"}
        </h2>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && (
            <>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={form.full_name} onChange={set("full_name")} required maxLength={80} />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input id="mobile" value={form.mobile} onChange={set("mobile")} required maxLength={20} />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={set("email")} required maxLength={255} />
          </div>

          {mode !== "forgot" && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={set("password")} required />
            </div>
          )}

          {mode === "register" && (
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" value={form.confirm} onChange={set("confirm")} required />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Login"
                : mode === "register"
                  ? "Create Account"
                  : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          {mode !== "forgot" ? (
            <button className="text-muted-foreground hover:text-primary" onClick={() => setMode("forgot")}>
              Forgot password?
            </button>
          ) : (
            <button className="text-muted-foreground hover:text-primary" onClick={() => setMode("login")}>
              Back to login
            </button>
          )}
        </div>

        <p className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          Owner, staff and kitchen sign in with the same form — after login you are redirected to your
          own dashboard based on the role assigned to your account.
        </p>
      </div>
    </div>
  );
}
