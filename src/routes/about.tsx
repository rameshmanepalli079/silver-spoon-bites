import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { RESTAURANT } from "@/lib/restaurant";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — RK Silver Spoon" },
      {
        name: "description",
        content:
          "The story behind RK Silver Spoon Multi Cuisine Restaurant — a family kitchen serving dum biryani, tandoori and Indo-Chinese.",
      },
      { property: "og:title", content: "About Us — RK Silver Spoon" },
      { property: "og:description", content: "A family kitchen serving dum biryani, tandoori and Indo-Chinese." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Our story</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">About {RESTAURANT.name}</h1>

      <img
        src="/images/hero.jpg"
        alt="Signature spread at RK Silver Spoon"
        loading="lazy"
        className="mt-8 w-full rounded-xl border border-border object-cover"
      />

      <div className="mt-8 space-y-5 text-muted-foreground">
        <p>
          RK Silver Spoon Multi Cuisine Restaurant was built around one simple idea — serve the food
          you would happily serve your own family. What began as a modest kitchen with a handful of
          tables has grown into a full multi-cuisine dining room.
        </p>
        <p>
          Our kitchen runs three distinct sections. The dum range handles our slow-sealed biryanis,
          layered with saffron rice and finished over a gentle flame. The clay oven turns out kebabs,
          tikkas and fresh breads all evening. The wok line delivers Indo-Chinese classics with a
          proper hit of smoke.
        </p>
        <p>
          We grind our masalas in-house, receive seafood every morning, and cook every order fresh.
          Nothing is pre-plated, nothing is reheated.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          { title: "Dum Range", text: "Sealed biryani handis, saffron and slow heat." },
          { title: "Clay Oven", text: "Kebabs, tikkas and hot breads to order." },
          { title: "Wok Line", text: "Indo-Chinese with real wok smoke." },
        ].map((c) => (
          <div key={c.title} className="card-elevated p-6">
            <h3 className="font-display text-xl">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/menu">
          <Button>View Menu</Button>
        </Link>
        <Link to="/reservations">
          <Button variant="outline">Reserve a Table</Button>
        </Link>
      </div>
    </div>
  );
}
