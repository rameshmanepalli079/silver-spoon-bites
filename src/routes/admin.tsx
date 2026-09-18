import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { RequireAuth } from "@/components/require-auth";
import { StaffConsole } from "@/routes/staff";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, rupees } from "@/lib/restaurant";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard — RK Silver Spoon" },
      {
        name: "description",
        content: "Owner dashboard: menu management, orders, reservations, tables, customers and feedback.",
      },
      { property: "og:title", content: "Owner Dashboard — RK Silver Spoon" },
      { property: "og:description", content: "Manage menu, orders, reservations and tables." },
    ],
  }),
  component: () => (
    <RequireAuth roles={["owner"]} title="Owner login">
      <OwnerDashboard />
    </RequireAuth>
  ),
});

const emptyItem = {
  name: "",
  description: "",
  price: "",
  category: CATEGORIES[0] as string,
  is_veg: true,
  is_available: true,
  is_bestseller: false,
  is_special: false,
  image_url: "/images/indian.jpg",
};

function OwnerDashboard() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"summary" | "menu" | "operations" | "feedback">("summary");

  const orders = useQuery({
    queryKey: ["owner-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const reservations = useQuery({
    queryKey: ["owner-reservations"],
    queryFn: async () => {
      const { data } = await supabase.from("reservations").select("*");
      return data ?? [];
    },
  });
  const tables = useQuery({
    queryKey: ["owner-tables"],
    queryFn: async () => {
      const { data } = await supabase.from("restaurant_tables").select("*");
      return data ?? [];
    },
  });
  const reviews = useQuery({
    queryKey: ["owner-reviews"],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const todays = (orders.data ?? []).filter((o) => o.created_at.slice(0, 10) === today);
  const revenue = todays
    .filter((o) => o.payment_status === "DEMO PAID" && o.status !== "CANCELLED")
    .reduce((s, o) => s + Number(o.total), 0);
  const pending = (orders.data ?? []).filter(
    (o) => !["COMPLETED", "CANCELLED"].includes(o.status),
  ).length;
  const availableTables = (tables.data ?? []).filter((t) => t.status === "AVAILABLE").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Owner</p>
      <h1 className="mt-2 font-display text-4xl">Restaurant Dashboard</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["summary", "menu", "operations", "feedback"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
            {t[0]!.toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Today's Orders", value: todays.length },
            { label: "Today's Revenue", value: rupees(revenue) },
            { label: "Pending Orders", value: pending },
            { label: "Reservations", value: (reservations.data ?? []).length },
            { label: "Available Tables", value: availableTables },
          ].map((c) => (
            <div key={c.label} className="card-elevated p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
              <p className="mt-2 font-display text-3xl text-primary">{c.value}</p>
            </div>
          ))}

          <div className="card-elevated col-span-full p-6">
            <h2 className="font-display text-2xl">Recent Customers & Orders</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-2">Order</th>
                    <th>Type</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {(orders.data ?? []).slice(0, 12).map((o) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="py-2">#{o.order_code}</td>
                      <td>{o.order_type}</td>
                      <td>{rupees(o.total)}</td>
                      <td>{o.payment_status}</td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                      <td>{new Date(o.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "menu" && <MenuManager />}

      {tab === "operations" && (
        <div className="mt-6">
          <StaffConsole owner />
          <TableManager />
        </div>
      )}

      {tab === "feedback" && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(reviews.data ?? []).map((r) => (
            <div key={r.id} className="card-elevated p-5">
              <div className="flex justify-between">
                <h3 className="font-display text-xl">{r.customer_name}</h3>
                <span className="text-primary">{r.overall_rating} ★</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Food {r.food_rating ?? "-"} ★ · Service {r.service_rating ?? "-"} ★
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
      <span className="sr-only">{queryClient ? "" : ""}</span>
    </div>
  );
}

function MenuManager() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(emptyItem);

  const { data: items = [] } = useQuery({
    queryKey: ["owner-menu"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").order("category");
      return data ?? [];
    },
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["owner-menu"] });
    void queryClient.invalidateQueries({ queryKey: ["menu"] });
  };

  const addItem = async () => {
    if (!draft.name.trim() || !draft.price) {
      toast.error("Name and price are required");
      return;
    }
    const { error } = await supabase.from("menu_items").insert({
      ...draft,
      name: draft.name.trim().slice(0, 80),
      description: draft.description.trim().slice(0, 200),
      price: Number(draft.price),
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Dish added");
      setDraft(emptyItem);
      refresh();
    }
  };

  const patch = async (id: string, values: Record<string, unknown>) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
      <div className="card-elevated h-fit space-y-3 p-6">
        <h2 className="font-display text-2xl">Add Food Item</h2>
        <div>
          <Label>Name</Label>
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Price (₹)</Label>
            <Input
              type="number"
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            />
          </div>
          <div>
            <Label>Category</Label>
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label>Image path</Label>
          <Input
            value={draft.image_url}
            onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
          />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            { key: "is_veg", label: "Veg" },
            { key: "is_available", label: "Available" },
            { key: "is_bestseller", label: "Bestseller" },
            { key: "is_special", label: "Today's Special" },
          ].map((f) => (
            <label key={f.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft[f.key as keyof typeof draft] as boolean}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.checked })}
              />
              {f.label}
            </label>
          ))}
        </div>
        <Button className="w-full" onClick={addItem}>
          Add to Menu
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card-elevated p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg">{item.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {item.category} · {item.is_veg ? "Veg" : "Non-Veg"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  defaultValue={String(item.price)}
                  className="w-24"
                  onBlur={(e) => {
                    const value = Number(e.target.value);
                    if (value !== Number(item.price)) void patch(item.id, { price: value });
                  }}
                />
                <Button
                  size="sm"
                  variant={item.is_available ? "outline" : "secondary"}
                  onClick={() => patch(item.id, { is_available: !item.is_available })}
                >
                  {item.is_available ? "Available" : "Unavailable"}
                </Button>
                <Button
                  size="sm"
                  variant={item.is_special ? "default" : "outline"}
                  onClick={() => patch(item.id, { is_special: !item.is_special })}
                >
                  Special
                </Button>
                <Button
                  size="sm"
                  variant={item.is_bestseller ? "default" : "outline"}
                  onClick={() => patch(item.id, { is_bestseller: !item.is_bestseller })}
                >
                  Bestseller
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await supabase.from("menu_items").delete().eq("id", item.id);
                    refresh();
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableManager() {
  const queryClient = useQueryClient();
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("4");

  return (
    <div className="card-elevated mt-8 max-w-md space-y-3 p-6">
      <h2 className="font-display text-2xl">Add Table</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Table Number</Label>
          <Input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="T9" />
        </div>
        <div>
          <Label>Capacity</Label>
          <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </div>
      </div>
      <Button
        onClick={async () => {
          if (!tableNumber.trim()) {
            toast.error("Enter a table number");
            return;
          }
          const { error } = await supabase.from("restaurant_tables").insert({
            table_number: tableNumber.trim().slice(0, 10),
            capacity: Math.max(1, Number(capacity) || 2),
          });
          if (error) toast.error(error.message);
          else {
            toast.success("Table added");
            setTableNumber("");
            void queryClient.invalidateQueries({ queryKey: ["tables"] });
            void queryClient.invalidateQueries({ queryKey: ["owner-tables"] });
          }
        }}
      >
        Add Table
      </Button>
    </div>
  );
}
