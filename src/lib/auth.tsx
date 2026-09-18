import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "customer" | "owner" | "staff" | "kitchen";

type AuthValue = {
  session: Session | null;
  loading: boolean;
  fullName: string;
  roles: AppRole[];
  isTeam: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async (userId: string) => {
      const [{ data: roleRows }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
      ]);
      if (!active) return;
      setRoles((roleRows ?? []).map((r) => r.role as AppRole));
      setFullName(profile?.full_name ?? "");
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
      if (data.session) void loadProfile(data.session.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
      if (next) {
        void loadProfile(next.user.id);
      } else {
        setRoles([]);
        setFullName("");
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value: AuthValue = {
    session,
    loading,
    fullName,
    roles,
    isTeam: roles.some((r) => r === "owner" || r === "staff" || r === "kitchen"),
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function homeForRoles(roles: AppRole[]) {
  if (roles.includes("owner")) return "/admin";
  if (roles.includes("kitchen")) return "/kitchen";
  if (roles.includes("staff")) return "/staff";
  return "/dashboard";
}
