import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { RESTAURANT, rupees } from "@/lib/restaurant";

type Msg = { from: "bot" | "user"; text: string };

type MenuRow = {
  name: string;
  price: number;
  category: string;
  is_veg: boolean;
  is_available: boolean;
  is_special: boolean;
};

const FALLBACK =
  "I'm the RK Silver Spoon Assistant. I can only help with our restaurant, menu, orders and reservations.";

function answer(input: string, menu: MenuRow[]): string {
  const q = input.toLowerCase().trim();
  if (!q) return FALLBACK;

  // Direct dish lookup first
  const dish = menu.find((m) => q.includes(m.name.toLowerCase()));
  if (dish) {
    return `${dish.name} — ${rupees(dish.price)} · ${dish.is_veg ? "Veg" : "Non-Veg"} · ${
      dish.category
    } · ${dish.is_available ? "Available now" : "Currently unavailable"}.`;
  }

  const has = (...words: string[]) => words.some((w) => q.includes(w));

  if (has("hi", "hello", "hey", "vanakkam"))
    return "Welcome to RK Silver Spoon! Ask me about our menu, prices, today's specials, table reservations, parcel orders or order tracking.";

  if (has("special", "today"))
    return (
      "Today's specials: " +
      (menu
        .filter((m) => m.is_special)
        .map((m) => `${m.name} (${rupees(m.price)})`)
        .join(", ") || "Ask our staff — specials are being updated.")
    );

  if (has("veg") && !has("non"))
    return `We have ${menu.filter((m) => m.is_veg).length} vegetarian dishes, including ${menu
      .filter((m) => m.is_veg)
      .slice(0, 4)
      .map((m) => m.name)
      .join(", ")}.`;

  if (has("non-veg", "nonveg", "non veg", "chicken", "mutton", "prawn", "fish"))
    return `Popular non-veg picks: ${menu
      .filter((m) => !m.is_veg)
      .slice(0, 5)
      .map((m) => `${m.name} (${rupees(m.price)})`)
      .join(", ")}.`;

  if (has("price", "cost", "rate", "how much"))
    return "Tell me the dish name (e.g. 'Chicken Biryani price') and I'll share the exact price.";

  if (has("available", "stock"))
    return "Type a dish name and I'll tell you whether it is available right now.";

  if (has("menu", "dish", "food", "eat"))
    return "Our menu covers Starters, Soups, Biryani, Indian, Chinese, Tandoori, Seafood, Rice, Noodles, Breads, Desserts and Beverages. Open the Menu page to order.";

  if (has("location", "address", "where", "map", "direction"))
    return `We are at ${RESTAURANT.address}. Google Maps: ${RESTAURANT.mapsLink}`;

  if (has("hour", "open", "close", "timing"))
    return RESTAURANT.hours.map((h) => `${h.day}: ${h.time}`).join(" | ");

  if (has("reserv", "table", "book"))
    return "Log in and open Reservations. Pick date, time, guests and seating — you'll get a reservation ID and a 5-digit verification code.";

  if (has("parcel", "takeaway", "pickup", "take away"))
    return "Choose PARCEL at checkout. You'll get an order ID and a 5-digit pickup code to show at the counter.";

  if (has("track", "status", "order"))
    return "Open Track Order or your dashboard — order status updates live: PLACED → ACCEPTED → PREPARING → COOKING → READY → COMPLETED.";

  if (has("pay", "payment", "upi", "card", "cash"))
    return "This is a demo build. Payments are simulated (UPI / Card / Cash) — no real money is charged.";

  if (has("contact", "phone", "call", "email"))
    return `Call ${RESTAURANT.phone} or email ${RESTAURANT.email}.`;

  return FALLBACK;
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuRow[]>([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text: "Hello! I'm the Silver Spoon Assistant. Ask me about the menu, prices, specials, reservations or your order.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || menu.length) return;
    void supabase
      .from("menu_items")
      .select("name, price, category, is_veg, is_available, is_special")
      .then(({ data }) => setMenu((data ?? []) as unknown as MenuRow[]));
  }, [open, menu.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }, { from: "bot", text: answer(text, menu) }]);
    setInput("");
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[26rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="font-display text-base text-primary">Silver Spoon Assistant</p>
              <p className="text-[0.65rem] text-muted-foreground">Menu · Orders · Reservations</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.from === "bot"
                    ? "bg-muted text-foreground"
                    : "ml-auto bg-primary text-primary-foreground"
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="flex gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about a dish, timing, parcel…"
            />
            <Button size="icon" onClick={send} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open restaurant assistant"
        className="fixed bottom-5 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-105"
      >
        <MessageCircle className="size-6" />
      </button>
    </>
  );
}
