import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — RK Silver Spoon" },
      { name: "description", content: "Set a new password for your RK Silver Spoon account." },
      { property: "og:title", content: "Reset Password — RK Silver Spoon" },
      { property: "og:description", content: "Set a new password for your account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl">Set a new password</h1>
      <form onSubmit={submit} className="card-elevated mt-6 space-y-4 p-6">
        <div>
          <Label htmlFor="pw">New Password</Label>
          <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="cf">Confirm Password</Label>
          <Input id="cf" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Updating…" : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
