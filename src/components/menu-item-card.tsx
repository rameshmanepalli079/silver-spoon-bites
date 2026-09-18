import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VegDot } from "@/components/status-badge";
import { useCart } from "@/lib/cart";
import { rupees } from "@/lib/restaurant";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_veg: boolean;
  is_available: boolean;
  is_bestseller: boolean;
  is_special: boolean;
  image_url: string | null;
};

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { add } = useCart();

  return (
    <article className="card-elevated flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image_url ?? "/images/indian.jpg"}
          alt={item.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {item.is_bestseller && (
            <span className="rounded-full bg-primary px-2 py-1 text-[0.6rem] font-semibold tracking-wide text-primary-foreground">
              BESTSELLER
            </span>
          )}
          {item.is_special && (
            <span className="rounded-full bg-accent px-2 py-1 text-[0.6rem] font-semibold tracking-wide text-accent-foreground">
              TODAY'S SPECIAL
            </span>
          )}
        </div>
        {!item.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/75 text-sm font-semibold tracking-widest text-muted-foreground">
            UNAVAILABLE
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-tight text-foreground">{item.name}</h3>
          <VegDot isVeg={item.is_veg} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          {item.category}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-xl text-primary">{rupees(item.price)}</span>
          <Button
            size="sm"
            disabled={!item.is_available}
            onClick={() => {
              add({
                id: item.id,
                name: item.name,
                price: Number(item.price),
                image_url: item.image_url,
                is_veg: item.is_veg,
              });
              toast.success(`${item.name} added to cart`);
            }}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
}
