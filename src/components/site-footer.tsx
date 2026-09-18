import { Link } from "@tanstack/react-router";
import { RESTAURANT } from "@/lib/restaurant";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-display text-2xl gold-text">{RESTAURANT.name}</h3>
          <p className="text-xs tracking-[0.3em] text-muted-foreground">{RESTAURANT.tagline}</p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Slow-cooked biryanis, clay-oven kebabs and wok-fired Chinese, served with the warmth of a
            family kitchen.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/menu" className="hover:text-primary">
                Digital Menu
              </Link>
            </li>
            <li>
              <Link to="/reservations" className="hover:text-primary">
                Reserve a Table
              </Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-primary">
                Track Order
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Visit Us</h4>
          <p className="text-sm text-muted-foreground">{RESTAURANT.address}</p>
          <p className="mt-2 text-sm text-muted-foreground">{RESTAURANT.phone}</p>
          <p className="text-sm text-muted-foreground">{RESTAURANT.email}</p>
          <a
            href={RESTAURANT.mapsLink}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {RESTAURANT.name}. Demo build — payments are simulated.
      </div>
    </footer>
  );
}
