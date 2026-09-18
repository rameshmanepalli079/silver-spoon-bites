import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, Phone, Star, UtensilsCrossed, Leaf, Truck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemCard, type MenuItem } from "@/components/menu-item-card";
import { supabase } from "@/integrations/supabase/client";
import { RESTAURANT, CATEGORIES } from "@/lib/restaurant";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RK Silver Spoon — Multi Cuisine Restaurant" },
      {
        name: "description",
        content:
          "Biryani, tandoori kebabs, Chinese and seafood at RK Silver Spoon. Order parcel or dine-in, reserve a table and track your order live.",
      },
      { property: "og:title", content: "RK Silver Spoon — Multi Cuisine Restaurant" },
      {
        property: "og:description",
        content: "Order parcel or dine-in, reserve a table and track your order live.",
      },
    ],
  }),
  component: Home,
});

const CATEGORY_IMAGE: Record<string, string> = {
  Starters: "/images/tandoori.jpg",
  Soups: "/images/drinks.jpg",
  Biryani: "/images/biryani.jpg",
  Indian: "/images/indian.jpg",
  Chinese: "/images/chinese.jpg",
  Tandoori: "/images/tandoori.jpg",
  Seafood: "/images/seafood.jpg",
  Vegetarian: "/images/indian.jpg",
  "Non-Vegetarian": "/images/tandoori.jpg",
  Rice: "/images/biryani.jpg",
  Noodles: "/images/chinese.jpg",
  Breads: "/images/indian.jpg",
  Desserts: "/images/dessert.jpg",
  Beverages: "/images/drinks.jpg",
};

const WHY = [
  { icon: UtensilsCrossed, title: "Multi Cuisine Kitchen", text: "Indian, Chinese, Tandoori and coastal seafood under one roof." },
  { icon: Leaf, title: "Fresh Every Day", text: "Daily market produce, house-ground masalas, no reheated gravies." },
  { icon: Truck, title: "Quick Parcel Pickup", text: "Order ahead, get a pickup code, collect in minutes." },
  { icon: Award, title: "Chef-Led Recipes", text: "Signature dum biryani slow-sealed the traditional way." },
];

function Section({
  eyebrow,
  title,
  children,
  id,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="section-pad">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mb-8 mt-2 font-display text-3xl sm:text-4xl">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Home() {
  const { data: menu = [] } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("*").order("name");
      if (error) throw error;
      return data as unknown as MenuItem[];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["home-reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const bestsellers = menu.filter((m) => m.is_bestseller).slice(0, 4);
  const specials = menu.filter((m) => m.is_special).slice(0, 4);
  const chefPicks = menu
    .filter((m) => ["Biryani", "Tandoori", "Seafood"].includes(m.category))
    .slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate">
        <img
          src="/images/hero.jpg"
          alt="RK Silver Spoon signature spread"
          width={1600}
          height={1008}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden
        />
        <div className="mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6">
          <p className="eyebrow">Since the first silver spoon</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-7xl lg:text-8xl">
            <span className="block gold-text">{RESTAURANT.name}</span>
            <span className="mt-3 block text-xl tracking-[0.35em] text-foreground sm:text-2xl">
              {RESTAURANT.tagline}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground">
            Slow-sealed dum biryani, clay-oven kebabs and wok-fired Chinese — crafted fresh, served
            warm, packed fast.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/menu">
              <Button size="lg">VIEW MENU</Button>
            </Link>
            <Link to="/menu">
              <Button size="lg" variant="secondary">
                ORDER NOW
              </Button>
            </Link>
            <Link to="/reservations">
              <Button size="lg" variant="outline">
                RESERVE TABLE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* POPULAR */}
      <Section eyebrow="Guest favourites" title="Popular Dishes">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      {/* SPECIALS */}
      <section className="section-pad bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">From the pass</p>
          <h2 className="mb-8 mt-2 font-display text-3xl sm:text-4xl">Today&apos;s Specials</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {specials.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <Section eyebrow="Explore" title="Food Categories">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to="/menu"
              search={{ category: cat }}
              className="group relative overflow-hidden rounded-lg border border-border"
            >
              <img
                src={CATEGORY_IMAGE[cat]}
                alt={cat}
                loading="lazy"
                className="h-24 w-full object-cover opacity-60 transition duration-500 group-hover:scale-110 group-hover:opacity-90"
              />
              <span className="absolute inset-0 flex items-center justify-center text-center text-xs font-semibold tracking-wide">
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* CHEF RECOMMENDATIONS */}
      <section className="section-pad bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Chef recommends</p>
          <h2 className="mb-8 mt-2 font-display text-3xl sm:text-4xl">Chef Recommendations</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {chefPicks.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <Section eyebrow="Our story" title="About the Restaurant">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <img
            src="/images/tandoori.jpg"
            alt="Kebabs from the clay oven"
            loading="lazy"
            className="rounded-xl border border-border object-cover"
          />
          <div className="space-y-4 text-muted-foreground">
            <p>
              RK Silver Spoon began as a small family kitchen with one belief — that a great meal is
              equal parts patience and generosity. Today our kitchen runs three sections: the dum
              range for biryani, the clay oven for kebabs and breads, and the wok line for
              Indo-Chinese.
            </p>
            <p>
              Everything is cooked to order. Our masalas are ground in-house, our seafood arrives
              each morning, and our biryani still gets sealed with dough the old-fashioned way.
            </p>
            <div className="flex flex-wrap gap-8 pt-2">
              <div>
                <p className="font-display text-3xl text-primary">30+</p>
                <p className="text-xs tracking-widest">DISHES</p>
              </div>
              <div>
                <p className="font-display text-3xl text-primary">4.8</p>
                <p className="text-xs tracking-widest">GUEST RATING</p>
              </div>
              <div>
                <p className="font-display text-3xl text-primary">8</p>
                <p className="text-xs tracking-widest">DINING TABLES</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* WHY CHOOSE US */}
      <section className="section-pad bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">The difference</p>
          <h2 className="mb-8 mt-2 font-display text-3xl sm:text-4xl">Why Choose Us</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <div key={w.title} className="card-elevated p-6">
                <w.icon className="mb-4 size-7 text-primary" />
                <h3 className="font-display text-xl">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <Section eyebrow="Guest book" title="Customer Reviews">
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.id} className="card-elevated p-6">
              <div className="mb-3 flex gap-1">
                {Array.from({ length: r.overall_rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">“{r.comment}”</p>
              <p className="mt-4 font-display text-lg">{r.customer_name}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* HOURS + LOCATION + CONTACT */}
      <section className="section-pad bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3">
          <div className="card-elevated p-6">
            <Clock className="mb-4 size-6 text-primary" />
            <h3 className="font-display text-2xl">Opening Hours</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {RESTAURANT.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{h.day}</span>
                  <span className="text-foreground">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-elevated p-6">
            <Phone className="mb-4 size-6 text-primary" />
            <h3 className="font-display text-2xl">Contact</h3>
            <p className="mt-4 text-sm text-muted-foreground">{RESTAURANT.phone}</p>
            <p className="text-sm text-muted-foreground">{RESTAURANT.email}</p>
            <p className="mt-2 text-sm text-muted-foreground">{RESTAURANT.address}</p>
            <Link to="/reservations">
              <Button className="mt-5">Reserve a Table</Button>
            </Link>
          </div>
          <div className="card-elevated overflow-hidden">
            <iframe
              title="RK Silver Spoon location"
              src={RESTAURANT.mapsEmbed}
              className="h-56 w-full border-0 lg:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
          <a
            href={RESTAURANT.mapsLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <MapPin className="size-4" /> Get directions on Google Maps
          </a>
        </div>
      </section>
    </div>
  );
}
