import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VegDot } from "@/components/status-badge";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { rupees } from "@/lib/restaurant";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart & Checkout — RK Silver Spoon" },
      {
        name: "description",
        content: "Review your order, choose dine-in or parcel, and complete the demo payment.",
      },
      { property: "og:title", content: "Your Cart & Checkout — RK Silver Spoon" },
      { property: "og:description", content: "Review your order and complete the demo payment." },
    ],
  }),
  component: CartPage,
});

type Placed = {
  id: string;
  order_code: string;
  pickup_code: string | null;
  total: number;
  order_type: string;
};

const UPI_APPS = ["Google Pay", "PhonePe", "Paytm", "Other UPI"];

function CartPage() {
  const { items, setQuantity, remove, subtotal, clear } = useCart();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState<"DINE_IN" | "PARCEL">("PARCEL");
  const [tableNumber, setTableNumber] = useState("");
  const [instructions, setInstructions] = useState("");
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [method, setMethod] = useState<"UPI" | "CARD" | "CASH">("UPI");
  const [upiApp, setUpiApp] = useState(UPI_APPS[0]!);
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);

  const placeOrder = async () => {
    if (!session) {
      navigate({ to: "/auth" });
      return;
    }
    if (orderType === "DINE_IN" && !tableNumber.trim()) {
      toast.error("Please enter your table number");
      return;
    }
    setBusy(true);
    const args: { _items: unknown; _order_type: string; _table_number?: string; _instructions?: string } = {
      _items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      _order_type: orderType,
    };
    if (orderType === "DINE_IN") args._table_number = tableNumber.trim();
    if (instructions.trim()) args._instructions = instructions.trim();
    const { data, error } = await (
      supabase.rpc as unknown as (
        fn: string,
        params: unknown,
      ) => Promise<{ data: unknown; error: { message: string } | null }>
    )("place_order", args);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const order = data as unknown as Placed;
    setPlaced(order);
    toast.success(`Order ${order.order_code} created`);
  };

  const simulatePayment = async (success: boolean) => {
    if (!placed) return;
    if (!success) {
      toast.error("DEMO payment failed. Please try another method.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc("pay_order", {
      _order_id: placed.id,
      _method: method === "UPI" ? `UPI · ${upiApp}` : method,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPaid(true);
    clear();
    toast.success("DEMO PAID — order sent to the kitchen");
  };

  if (paid && placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="eyebrow">Demo payment successful</p>
        <h1 className="mt-3 font-display text-4xl">ORDER #{placed.order_code}</h1>
        {placed.pickup_code && (
          <p className="mt-4 text-lg">
            Pickup Code: <span className="font-display text-3xl text-primary">{placed.pickup_code}</span>
          </p>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          Amount {rupees(placed.total)} · Status DEMO PAID. Track live status in your dashboard.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link to="/menu">
            <Button variant="outline">Order more</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-primary/50 bg-primary/10 p-4 text-center">
          <p className="font-semibold text-primary">DEMO PAYMENT</p>
          <p className="text-xs text-muted-foreground">No real money will be charged.</p>
        </div>

        <h1 className="mt-8 font-display text-3xl">ORDER #{placed.order_code}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Amount payable {rupees(placed.total)} (calculated from menu prices)
        </p>

        <div className="card-elevated mt-6 space-y-5 p-6">
          <div className="flex gap-2">
            {(["UPI", "CARD", "CASH"] as const).map((m) => (
              <Button
                key={m}
                variant={method === m ? "default" : "outline"}
                size="sm"
                onClick={() => setMethod(m)}
              >
                {m}
              </Button>
            ))}
          </div>

          {method === "UPI" && (
            <div className="grid grid-cols-2 gap-2">
              {UPI_APPS.map((app) => (
                <Button
                  key={app}
                  variant={upiApp === app ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setUpiApp(app)}
                >
                  {app}
                </Button>
              ))}
            </div>
          )}

          {method === "CARD" && (
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              Card details are never collected or stored in this demo. Simulation only.
            </p>
          )}

          {method === "CASH" && (
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              Pay at the counter. Simulated as DEMO PAID for the demo flow.
            </p>
          )}

          <Button className="w-full" disabled={busy} onClick={() => simulatePayment(true)}>
            SIMULATE PAYMENT SUCCESS
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={busy}
            onClick={() => simulatePayment(false)}
          >
            Simulate payment failure
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="eyebrow">Your order</p>
      <h1 className="mt-2 font-display text-4xl">Cart</h1>

      {items.length === 0 ? (
        <div className="mt-10 text-muted-foreground">
          <p>Your cart is empty.</p>
          <Link to="/menu" className="mt-4 inline-block">
            <Button>Browse the menu</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card-elevated flex items-center gap-4 p-4">
                <img
                  src={item.image_url ?? "/images/indian.jpg"}
                  alt={item.name}
                  loading="lazy"
                  className="size-20 rounded-md object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <VegDot isVeg={item.is_veg} />
                    <h3 className="font-display text-lg">{item.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{rupees(item.price)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(item.id, item.quantity - 1)}
                    aria-label="Decrease"
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(item.id, item.quantity + 1)}
                    aria-label="Increase"
                  >
                    <Plus className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(item.id)} aria-label="Remove">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="card-elevated h-fit space-y-5 p-6">
            <h2 className="font-display text-2xl">Order Summary</h2>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{rupees(subtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-lg">
              <span>Total</span>
              <span className="font-display text-primary">{rupees(subtotal)}</span>
            </div>
            <p className="text-[0.7rem] text-muted-foreground">
              Final amount is recalculated from live menu prices when the order is created.
            </p>

            <div>
              <Label className="mb-2 block">Order Type</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={orderType === "DINE_IN" ? "default" : "outline"}
                  onClick={() => setOrderType("DINE_IN")}
                >
                  Dine-In
                </Button>
                <Button
                  size="sm"
                  variant={orderType === "PARCEL" ? "default" : "outline"}
                  onClick={() => setOrderType("PARCEL")}
                >
                  Parcel / Takeaway
                </Button>
              </div>
            </div>

            {orderType === "DINE_IN" && (
              <div>
                <Label htmlFor="table">Table Number</Label>
                <Input
                  id="table"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T3"
                  maxLength={10}
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Special Instructions</Label>
              <Textarea
                id="notes"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                maxLength={300}
                placeholder="Less spicy, no onion…"
              />
            </div>

            <Button className="w-full" onClick={placeOrder} disabled={busy}>
              {session ? "Continue to Demo Payment" : "Login to Order"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
