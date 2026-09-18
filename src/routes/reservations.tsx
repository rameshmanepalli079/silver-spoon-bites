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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Table Reservations — RK Silver Spoon" },
      {
        name: "description",
        content:
          "Reserve a table at RK Silver Spoon. Pick your date, time, guests and seating — you get a reservation ID and verification code.",
      },
      { property: "og:title", content: "Table Reservations — RK Silver Spoon" },
      { property: "og:description", content: "Reserve your table and get an instant verification code." },
    ],
  }),
  component: ReservationsPage,
});

const SEATING = ["Indoor", "Outdoor", "Family Cabin", "Window Side"];

function ReservationsPage() {
  return (
    <RequireAuth title="Login to reserve a table">
      <ReservationForm />
    </RequireAuth>
  );
}

function ReservationForm() {
  const { session, fullName } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: fullName,
    mobile: "",
    guests: "2",
    reserved_date: "",
    reserved_time: "19:30",
    seating: SEATING[0]!,
    request: "",
  });

  const { data: mine = [] } = useQuery({
    queryKey: ["my-reservations", session?.user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!form.name.trim() || !form.mobile.trim() || !form.reserved_date) {
      toast.error("Please fill name, mobile and date");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        user_id: session.user.id,
        name: form.name.trim().slice(0, 80),
        mobile: form.mobile.trim().slice(0, 20),
        guests: Math.max(1, Math.min(30, Number(form.guests) || 1)),
        reserved_date: form.reserved_date,
        reserved_time: form.reserved_time,
        seating: form.seating,
        request: form.request.trim().slice(0, 300),
        reservation_code: "",
        verify_code: "",
      })
      .select()
      .maybeSingle();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Reservation ${data?.reservation_code} created — code ${data?.verify_code}`);
    void queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Book your evening</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Table Reservation</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={submit} className="card-elevated space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input id="mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="guests">Number of Guests</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                max={30}
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.reserved_date}
                onChange={(e) => setForm({ ...form, reserved_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={form.reserved_time}
                onChange={(e) => setForm({ ...form, reserved_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="seating">Preferred Seating</Label>
              <select
                id="seating"
                value={form.seating}
                onChange={(e) => setForm({ ...form, seating: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {SEATING.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="request">Special Request</Label>
            <Textarea
              id="request"
              value={form.request}
              onChange={(e) => setForm({ ...form, request: e.target.value })}
              maxLength={300}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Booking…" : "Reserve Table"}
          </Button>
        </form>

        <div>
          <h2 className="font-display text-2xl">My Reservations</h2>
          <div className="mt-4 space-y-4">
            {mine.length === 0 && <p className="text-sm text-muted-foreground">No reservations yet.</p>}
            {mine.map((r) => (
              <div key={r.id} className="card-elevated p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-xl">{r.reservation_code}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {r.reserved_date} at {r.reserved_time} · {r.guests} guests · {r.seating}
                </p>
                <p className="mt-2 text-sm">
                  Verification code:{" "}
                  <span className="font-display text-xl text-primary">{r.verify_code}</span>
                </p>
                {["PENDING", "CONFIRMED"].includes(r.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={async () => {
                      await supabase.from("reservations").update({ status: "CANCELLED" }).eq("id", r.id);
                      void queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
