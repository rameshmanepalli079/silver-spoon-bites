import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_FLOW, TABLE_STATUSES, rupees } from "@/lib/restaurant";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff Console — RK Silver Spoon" },
      {
        name: "description",
        content: "Staff console: manage live orders, reservations, tables and verify pickup codes.",
      },
      { property: "og:title", content: "Staff Console — RK Silver Spoon" },
      { property: "og:description", content: "Manage orders, reservations and tables." },
    ],
  }),
  component: () => (
    <RequireAuth roles={["staff", "owner"]} title="Staff login">
      <StaffConsole />
    </RequireAuth>
  ),
});

export function StaffConsole({ owner = false }: { owner?: boolean }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"orders" | "reservations" | "tables">("orders");

  const orders = useQuery({
    queryKey: ["staff-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(60);
      return data ?? [];
    },
  });

  const reservations = useQuery({
    queryKey: ["staff-reservations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60);
      return data ?? [];
    },
  });

  const tables = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const { data } = await supabase.from("restaurant_tables").select("*").order("table_number");
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("staff-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () =>
        queryClient.invalidateQueries({ queryKey: ["staff-orders"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () =>
        queryClient.invalidateQueries({ queryKey: ["staff-reservations"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_tables" }, () =>
        queryClient.invalidateQueries({ queryKey: ["tables"] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const setOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else void queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
  };

  const setReservationStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else void queryClient.invalidateQueries({ queryKey: ["staff-reservations"] });
  };

  return (
    <div className={owner ? "" : "mx-auto max-w-7xl px-4 py-10 sm:px-6"}>
      {!owner && (
        <>
          <p className="eyebrow">Operations</p>
          <h1 className="mt-2 font-display text-4xl">Staff Console</h1>
        </>
      )}

      <div className="mt-6 flex gap-2">
        {(["orders", "reservations", "tables"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
            {t[0]!.toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="mt-6 space-y-4">
          {(orders.data ?? []).map((o) => (
            <div key={o.id} className="card-elevated p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-xl">#{o.order_code}</h3>
                <div className="flex items-center gap-2">
                  <StatusBadge status={o.payment_status} />
                  <StatusBadge status={o.status} />
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {o.order_type === "PARCEL" ? "PARCEL" : `DINE-IN · Table ${o.table_number}`} ·{" "}
                {rupees(o.total)} · {new Date(o.created_at).toLocaleString()}
              </p>
              <ul className="mt-2 text-sm">
                {o.order_items?.map((it) => (
                  <li key={it.id}>
                    {it.item_name} ×{it.quantity}
                  </li>
                ))}
              </ul>
              {o.instructions && <p className="mt-2 text-sm">Note: {o.instructions}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {ORDER_FLOW.filter((s) => s !== "COMPLETED").map((s) => (
                  <Button key={s} size="sm" variant="outline" onClick={() => setOrderStatus(o.id, s)}>
                    {s}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => setOrderStatus(o.id, "CANCELLED")}>
                  Cancel
                </Button>
              </div>

              {o.order_type === "PARCEL" && o.status === "READY" && (
                <PickupVerify orderId={o.id} onDone={() => queryClient.invalidateQueries({ queryKey: ["staff-orders"] })} />
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "reservations" && (
        <div className="mt-6 space-y-4">
          {(reservations.data ?? []).map((r) => (
            <div key={r.id} className="card-elevated p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-xl">
                  {r.reservation_code} · {r.name}
                </h3>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {r.reserved_date} at {r.reserved_time} · {r.guests} guests · {r.seating} · {r.mobile}
              </p>
              {r.request && <p className="mt-1 text-sm">Request: {r.request}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setReservationStatus(r.id, "CONFIRMED")}>
                  Confirm
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReservationStatus(r.id, "SEATED")}>
                  Seated
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReservationStatus(r.id, "COMPLETED")}>
                  Complete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReservationStatus(r.id, "REJECTED")}>
                  Reject
                </Button>
              </div>
              <ReservationVerify reservationId={r.id} />
            </div>
          ))}
        </div>
      )}

      {tab === "tables" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(tables.data ?? []).map((t) => (
            <div key={t.id} className="card-elevated p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl">{t.table_number}</h3>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Seats {t.capacity}</p>
              <select
                value={t.status}
                onChange={async (e) => {
                  await supabase
                    .from("restaurant_tables")
                    .update({ status: e.target.value, updated_at: new Date().toISOString() })
                    .eq("id", t.id);
                  void queryClient.invalidateQueries({ queryKey: ["tables"] });
                }}
                className="mt-3 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                {TABLE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PickupVerify({ orderId, onDone }: { orderId: string; onDone: () => void }) {
  const [code, setCode] = useState("");
  return (
    <div className="mt-4 flex gap-2 border-t border-border pt-4">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="5-digit pickup code"
        maxLength={5}
        className="max-w-[12rem]"
      />
      <Button
        onClick={async () => {
          const { data, error } = await supabase.rpc("verify_pickup", { _order_id: orderId, _code: code.trim() });
          if (error) toast.error(error.message);
          else if (data) {
            toast.success("Code verified — order COMPLETED");
            onDone();
          } else toast.error("Invalid pickup code");
        }}
      >
        Verify & Complete
      </Button>
    </div>
  );
}

function ReservationVerify({ reservationId }: { reservationId: string }) {
  const [code, setCode] = useState("");
  return (
    <div className="mt-3 flex gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Verification code"
        maxLength={5}
        className="max-w-[12rem]"
      />
      <Button
        variant="secondary"
        onClick={async () => {
          const { data, error } = await supabase.rpc("verify_reservation", {
            _reservation_id: reservationId,
            _code: code.trim(),
          });
          if (error) toast.error(error.message);
          else if (data) toast.success("Reservation verified — guest seated");
          else toast.error("Invalid verification code");
        }}
      >
        Verify Code
      </Button>
    </div>
  );
}
