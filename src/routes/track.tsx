import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_FLOW, rupees } from "@/lib/restaurant";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Order — RK Silver Spoon" },
      {
        name: "description",
        content:
          "Enter your order number to follow it live: placed, accepted, preparing, cooking, ready and completed.",
      },
      { property: "og:title", content: "Track Your Order — RK Silver Spoon" },
      { property: "og:description", content: "Follow your order live from placed to ready." },
    ],
  }),
  component: TrackPage,
});

type OrderRow = {
  id: string;
  order_code: string;
  status: string;
  payment_status: string;
  order_type: string;
  pickup_code: string | null;
  total: number;
};

function TrackPage() {
  const { session } = useAuth();
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [error, setError] = useState("");

  const search = async () => {
    setError("");
    const clean = code.trim().toUpperCase().replace("#", "");
    const { data } = await supabase
      .from("orders")
      .select("id, order_code, status, payment_status, order_type, pickup_code, total")
      .eq("order_code", clean)
      .maybeSingle();
    if (!data) {
      setOrder(null);
      setError(
        session
          ? "No order found with that number on your account."
          : "Please login first — orders are private to your account.",
      );
      return;
    }
    setOrder(data as unknown as OrderRow);
  };

  useEffect(() => {
    if (!order) return;
    const channel = supabase
      .channel(`track-${order.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
        (payload) => setOrder(payload.new as unknown as OrderRow),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [order?.id]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Live status</p>
      <h1 className="mt-2 font-display text-4xl">Track Order</h1>

      <div className="mt-8 flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Order number e.g. SS4821"
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <Button onClick={search}>Track</Button>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {order && (
        <div className="card-elevated mt-8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl">ORDER #{order.order_code}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {order.order_type === "PARCEL" ? "Parcel / Takeaway" : "Dine-In"} · {rupees(order.total)} ·{" "}
            {order.payment_status}
          </p>

          <ol className="mt-6 space-y-3">
            {ORDER_FLOW.map((step) => {
              const idx = ORDER_FLOW.indexOf(order.status as (typeof ORDER_FLOW)[number]);
              const done = idx >= ORDER_FLOW.indexOf(step) && idx !== -1;
              return (
                <li key={step} className="flex items-center gap-3">
                  <span
                    className={`size-3 rounded-full ${done ? "bg-primary" : "bg-muted"}`}
                    aria-hidden
                  />
                  <span className={done ? "text-foreground" : "text-muted-foreground"}>{step}</span>
                </li>
              );
            })}
          </ol>

          {order.status === "CANCELLED" && (
            <p className="mt-4 text-sm text-destructive">This order was cancelled.</p>
          )}

          {order.status === "READY" && order.order_type === "PARCEL" && order.pickup_code && (
            <div className="mt-6 rounded-lg border border-primary/50 bg-primary/10 p-4 text-center">
              <p className="font-semibold text-primary">YOUR ORDER IS READY FOR PICKUP</p>
              <p className="mt-2 text-sm">Show this code at the counter</p>
              <p className="font-display text-4xl text-primary">{order.pickup_code}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
