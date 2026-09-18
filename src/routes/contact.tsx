import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { RESTAURANT } from "@/lib/restaurant";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Location — RK Silver Spoon" },
      {
        name: "description",
        content:
          "Call, email or visit RK Silver Spoon Multi Cuisine Restaurant. Opening hours, address and Google Maps directions.",
      },
      { property: "og:title", content: "Contact & Location — RK Silver Spoon" },
      { property: "og:description", content: "Opening hours, address and directions to RK Silver Spoon." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Say hello</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Contact & Location</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card-elevated flex gap-4 p-6">
            <Phone className="size-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-display text-xl">Call Us</h3>
              <a href={`tel:${RESTAURANT.phone}`} className="text-sm text-muted-foreground hover:text-primary">
                {RESTAURANT.phone}
              </a>
            </div>
          </div>
          <div className="card-elevated flex gap-4 p-6">
            <Mail className="size-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-display text-xl">Email</h3>
              <a href={`mailto:${RESTAURANT.email}`} className="text-sm text-muted-foreground hover:text-primary">
                {RESTAURANT.email}
              </a>
            </div>
          </div>
          <div className="card-elevated flex gap-4 p-6">
            <MapPin className="size-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-display text-xl">Address</h3>
              <p className="text-sm text-muted-foreground">{RESTAURANT.address}</p>
              <a
                href={RESTAURANT.mapsLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
          <div className="card-elevated flex gap-4 p-6">
            <Clock className="size-5 shrink-0 text-primary" />
            <div className="w-full">
              <h3 className="font-display text-xl">Opening Hours</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {RESTAURANT.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day}</span>
                    <span className="text-foreground">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="card-elevated min-h-[24rem] overflow-hidden">
          <iframe
            title="RK Silver Spoon location"
            src={RESTAURANT.mapsEmbed}
            className="size-full min-h-[24rem] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
