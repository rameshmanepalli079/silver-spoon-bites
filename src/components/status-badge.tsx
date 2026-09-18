const TONE: Record<string, string> = {
  PLACED: "bg-muted text-foreground",
  ACCEPTED: "bg-primary/20 text-primary",
  PREPARING: "bg-primary/20 text-primary",
  COOKING: "bg-accent/30 text-accent-foreground",
  READY: "bg-success/20 text-success",
  COMPLETED: "bg-success/20 text-success",
  CANCELLED: "bg-destructive/20 text-destructive",
  PENDING: "bg-muted text-foreground",
  CONFIRMED: "bg-success/20 text-success",
  SEATED: "bg-primary/20 text-primary",
  REJECTED: "bg-destructive/20 text-destructive",
  AVAILABLE: "bg-success/20 text-success",
  RESERVED: "bg-primary/20 text-primary",
  OCCUPIED: "bg-accent/30 text-accent-foreground",
  CLEANING: "bg-muted text-muted-foreground",
  "DEMO PAID": "bg-success/20 text-success",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-semibold tracking-wide ${
        TONE[status] ?? "bg-muted text-foreground"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function VegDot({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      title={isVeg ? "Veg" : "Non-Veg"}
      className={`inline-flex size-4 items-center justify-center rounded-[3px] border ${
        isVeg ? "border-veg" : "border-nonveg"
      }`}
    >
      <span className={`size-2 rounded-full ${isVeg ? "bg-veg" : "bg-nonveg"}`} />
    </span>
  );
}
