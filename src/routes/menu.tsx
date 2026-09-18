import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MenuItemCard, type MenuItem } from "@/components/menu-item-card";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/restaurant";

type MenuSearch = { category?: string };

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>): MenuSearch => ({
    category: typeof search['category'] === "string" ? search['category'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Digital Menu — RK Silver Spoon" },
      {
        name: "description",
        content:
          "Browse the full RK Silver Spoon menu: biryani, tandoori, Chinese, seafood, breads and desserts with live availability.",
      },
      { property: "og:title", content: "Digital Menu — RK Silver Spoon" },
      { property: "og:description", content: "Browse biryani, tandoori, Chinese and seafood with live availability." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<"all" | "veg" | "nonveg">("all");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("*").order("category");
      if (error) throw error;
      return data as unknown as MenuItem[];
    },
  });

  const filtered = items.filter((item) => {
    if (category && item.category !== category) return false;
    if (diet === "veg" && !item.is_veg) return false;
    if (diet === "nonveg" && item.is_veg) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  const setCategory = (value?: string) =>
    navigate({ search: value ? { category: value } : {} });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="eyebrow">Freshly cooked to order</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Digital Menu</h1>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "veg", "nonveg"] as const).map((d) => (
            <Button
              key={d}
              size="sm"
              variant={diet === d ? "default" : "outline"}
              onClick={() => setDiet(d)}
            >
              {d === "all" ? "All" : d === "veg" ? "Veg" : "Non-Veg"}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={!category ? "default" : "outline"}
          onClick={() => setCategory(undefined)}
        >
          All Categories
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={category === cat ? "default" : "outline"}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-12 text-muted-foreground">Loading menu…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-12 text-muted-foreground">No dishes match your filters.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
