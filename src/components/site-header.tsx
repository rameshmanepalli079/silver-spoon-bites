import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth, homeForRoles } from "@/lib/auth";
import { RESTAURANT } from "@/lib/restaurant";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/reservations", label: "Reservations" },
  { to: "/track", label: "Track Order" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { session, roles, fullName, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const accountHref = session ? homeForRoles(roles) : "/auth";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex size-11 items-center justify-center rounded-full border border-primary/60 font-display text-lg font-semibold text-primary">
            RK
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-wide gold-text sm:text-xl">
              {RESTAURANT.name}
            </span>
            <span className="block text-[0.6rem] tracking-[0.3em] text-muted-foreground sm:text-[0.65rem]">
              {RESTAURANT.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm transition-colors hover:text-primary ${
                pathname === item.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingBag className="size-5" />
            </Button>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[0.65rem] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          {session ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to={accountHref}>
                <Button variant="outline" size="sm">
                  <UserRound className="mr-1 size-4" />
                  {fullName ? fullName.split(" ")[0] : "Account"}
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/auth" className="hidden sm:block">
              <Button size="sm">Login</Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/50 py-3 text-sm text-muted-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            {session ? (
              <div className="flex gap-2 py-3">
                <Link to={accountHref} onClick={() => setOpen(false)} className="flex-1">
                  <Button variant="outline" className="w-full">
                    My Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    setOpen(false);
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="py-3">
                <Button className="w-full">Login / Register</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
