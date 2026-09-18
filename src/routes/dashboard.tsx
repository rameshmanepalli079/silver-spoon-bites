import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ORDER_FLOW, rupees } from "@/lib/restaurant";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — RK Silver Spoon" },
      {
        name: "description",
        content: "Your current order, order history, reservations and profile at RK Silver Spoon.",
      },
      { property: "og:title", content: "My Dashboard — RK Silver Spoon" },
      { property: "og:description", content: "Track your current order, history and reservations." },
    ],
  }),
  component: () => (
    <RequireAuth title="Login to view your dashboard">
      <CustomerDashboard />
    </RequireAuth>
  ),
});

function CustomerDashboard() {
  const { session, fullName } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  const orders = useQuery({
    queryKey: ["my-orders", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!userId,
  });

  const reservations = useQuery({
    queryKey: ["my-reservations", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("customer-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const all = orders.data ?? [];
  const current = all.find((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
  const history = all.filter((o) => ["COMPLETED", "CANCELLED"].includes(o.status));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="eyebrow">Customer dashboard</p>
      <h1 className="mt-2 font-display text-4xl">Welcome, {fullName || "Guest"}</h1>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Current Order</h2>
        {!current ? (
          <div className="card-elevated mt-4 p-6 text-sm text-muted-foreground">
            No active order.{" "}
            <Link to="/menu" className="text-primary hover:underline">
              Order something delicious
            </Link>
            .
          </div>
        ) : (
          <div className="card-elevated mt-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-2xl">ORDER #{current.order_code}</h3>
              <StatusBadge status={current.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {current.order_type === "PARCEL" ? "Parcel / Takeaway" : `Dine-In · Table ${current.table_number}`} ·{" "}
              {rupees(current.total)} · {current.payment_status}
            </p>

            <ul className="mt-4 space-y-1 text-sm">
              {current.order_items?.map((it) => (
                <li key={it.id}>
                  {it.item_name} ×{it.quantity} — {rupees(Number(it.unit_price) * it.quantity)}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              {ORDER_FLOW.map((step) => {
                const idx = ORDER_FLOW.indexOf(current.status as (typeof ORDER_FLOW)[number]);
                const done = idx !== -1 && idx >= ORDER_FLOW.indexOf(step);
                return (
                  <span
                    key={step}
                    className={`rounded-full px-3 py-1 text-[0.65rem] ${
                      done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>
                );
              })}
            </div>

            {current.status === "READY" && current.order_type === "PARCEL" && (
              <div className="mt-6 rounded-lg border border-primary/50 bg-primary/10 p-4 text-center">
                <p className="font-semibold text-primary">YOUR ORDER IS READY FOR PICKUP</p>
                <p className="mt-1 text-sm">Order #{current.order_code}</p>
                <p className="font-display text-4xl text-primary">{current.pickup_code}</p>
                <p className="text-xs text-muted-foreground">Show this pickup code at the counter</p>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Order History</h2>
        <div className="mt-4 space-y-4">
          {history.length === 0 && <p className="text-sm text-muted-foreground">No past orders yet.</p>}
          {history.map((o) => (
            <div key={o.id} className="card-elevated p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-xl">#{o.order_code}</h3>
                <StatusBadge status={o.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(o.created_at).toLocaleString()} · {rupees(o.total)}
              </p>
              {o.status === "COMPLETED" && <FeedbackForm orderId={o.id} />}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Reservations</h2>
        <div className="mt-4 space-y-4">
          {(reservations.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              No reservations.{" "}
              <Link to="/reservations" className="text-primary hover:underline">
                Reserve a table
              </Link>
              .
            </p>
          )}
          {(reservations.data ?? []).map((r) => (
            <div key={r.id} className="card-elevated p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-xl">{r.reservation_code}</h3>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {r.reserved_date} at {r.reserved_time} · {r.guests} guests · {r.seating}
              </p>
              <p className="mt-1 text-sm">
                Verification code: <span className="text-primary">{r.verify_code}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <ProfileCard />
    </div>
  );
}

function ProfileCard() {
  const { session, fullName } = useAuth();
  const [name, setName] = useState(fullName);
  const [mobile, setMobile] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!session || loaded) return;
    void supabase
      .from("profiles")
      .select("full_name, mobile")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setName(data.full_name ?? "");
          setMobile(data.mobile ?? "");
        }
        setLoaded(true);
      });
  }, [session, loaded]);

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl">Profile</h2>
      <div className="card-elevated mt-4 max-w-md space-y-4 p-6">
        <div>
          <Label htmlFor="pname">Full Name</Label>
          <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </div>
        <div>
          <Label htmlFor="pmobile">Mobile</Label>
          <Input id="pmobile" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={20} />
        </div>
        <p className="text-sm text-muted-foreground">{session?.user.email}</p>
        <Button
          onClick={async () => {
            const { error } = await supabase
              .from("profiles")
              .update({ full_name: name.trim().slice(0, 80), mobile: mobile.trim().slice(0, 20) })
              .eq("id", session!.user.id);
            if (error) toast.error(error.message);
            else toast.success("Profile updated");
          }}
        >
          Save Profile
        </Button>
      </div>
    </section>
  );
}

function FeedbackForm({ orderId }: { orderId: string }) {
  const { session, fullName } = useAuth();
  const [open, setOpen] = useState(false);
  const [overall, setOverall] = useState("5");
  const [food, setFood] = useState("5");
  const [service, setService] = useState("5");
  const [comment, setComment] = useState("");

  if (!open) {
    return (
      <Button size="sm" variant="outline" className="mt-3" onClick={() => setOpen(true)}>
        Leave feedback
      </Button>
    );
  }

  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Overall", value: overall, set: setOverall },
          { label: "Food", value: food, set: setFood },
          { label: "Service", value: service, set: setService },
        ].map((f) => (
          <div key={f.label}>
            <Label>{f.label}</Label>
            <select
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={400}
        placeholder="Tell us how it was…"
      />
      <Button
        size="sm"
        onClick={async () => {
          const { error } = await supabase.from("reviews").insert({
            user_id: session!.user.id,
            order_id: orderId,
            customer_name: fullName || "Guest",
            overall_rating: Number(overall),
            food_rating: Number(food),
            service_rating: Number(service),
            comment: comment.trim().slice(0, 400),
          });
          if (error) toast.error(error.message);
          else {
            toast.success("Thank you for your feedback!");
            setOpen(false);
          }
        }}
      >
        Submit feedback
      </Button>
    </div>
  );
}
