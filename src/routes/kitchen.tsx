import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/kitchen")({
  head: () => ({
    meta: [
      { title: "Kitchen Display — RK Silver Spoon" },
      { name: "description", content: "Kitchen order screen for RK Silver Spoon — accept, prepare, cook and mark ready." },
      { property: "og:title", content: "Kitchen Display — RK Silver Spoon" },
      { property: "og:description", content: "Live kitchen order screen." },
    ],
  }),
  component: () => (
    <RequireAuth roles={["kitchen", "owner"]} title="Kitchen login">
      <KitchenBoard />
    </RequireAuth>
  ),
});

const NEXT: Record<string, string[]> = {
  PLACED: ["ACCEPTED"],
  ACCEPTED: ["PREPARING"],
  PREPARING: ["COOKING"],
  COOKING: ["READY"],
};

function KitchenBoard() {
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["kitchen-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .in("status", ["PLACED", "ACCEPTED", "PREPARING", "COOKING", "READY"])
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("kitchen-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const update = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else void queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Kitchen display</p>
      <h1 className="mt-2 font-display text-4xl">Incoming Orders</h1>

      {orders.length === 0 && <p className="mt-8 text-muted-foreground">No live orders right now.</p>}

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((o) => (
          <div key={o.id} className="card-elevated p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl">ORDER #{o.order_code}</h2>
              <StatusBadge status={o.status} />
            </div>
            <ul className="mt-4 space-y-2 text-lg">
              {o.order_items?.map((it) => (
                <li key={it.id}>
                  {it.item_name} <span className="text-primary">×{it.quantity}</span>
                </li>
              ))}
            </ul>
            {o.instructions && (
              <p className="mt-3 rounded-md bg-muted p-2 text-sm">Note: {o.instructions}</p>
            )}
            <p className="mt-4 text-sm tracking-wide text-muted-foreground">
              TYPE: {o.order_type === "PARCEL" ? "PARCEL" : `DINE-IN · TABLE ${o.table_number}`}
              <br />
              PAYMENT: {o.payment_status}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(NEXT[o.status] ?? []).map((next) => (
                <Button key={next} size="lg" onClick={() => update(o.id, next)}>
                  {next}
                </Button>
              ))}
              {o.status === "READY" && (
                <p className="text-sm text-success">Waiting for pickup / service</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
