import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth, type AppRole } from "@/lib/auth";

export function RequireAuth({
  children,
  roles,
  title = "Please sign in",
}: {
  children: ReactNode;
  roles?: AppRole[];
  title?: string;
}) {
  const { session, loading, roles: myRoles } = useAuth();

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-24 text-muted-foreground">Loading…</div>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You need an account to continue. Login or register — it takes a few seconds.
        </p>
        <Link to="/auth" className="mt-6 inline-block">
          <Button>Login / Register</Button>
        </Link>
      </div>
    );
  }

  if (roles && !roles.some((r) => myRoles.includes(r))) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Access restricted</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This area is for {roles.join(" / ")} accounts only.
        </p>
        <Link to="/dashboard" className="mt-6 inline-block">
          <Button variant="outline">Go to my dashboard</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
