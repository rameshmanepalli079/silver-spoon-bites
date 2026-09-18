export const RESTAURANT = {
  name: "RK SILVER SPOON",
  tagline: "MULTI CUISINE RESTAURANT",
  phone: "+91 98765 43210",
  email: "hello@rksilverspoon.com",
  address: "Main Road, Near Bus Stand, Tamil Nadu, India",
  hours: [
    { day: "Monday – Thursday", time: "11:00 AM – 11:00 PM" },
    { day: "Friday – Saturday", time: "11:00 AM – 12:00 AM" },
    { day: "Sunday", time: "11:00 AM – 11:00 PM" },
  ],
  mapsLink: "https://maps.app.goo.gl/dUGTCxtAts9Xggis9?g_st=ac",
  mapsEmbed:
    "https://www.google.com/maps?q=RK+Silver+Spoon+Multi+Cuisine+Restaurant&output=embed",
};

export const CATEGORIES = [
  "Starters",
  "Soups",
  "Biryani",
  "Indian",
  "Chinese",
  "Tandoori",
  "Seafood",
  "Vegetarian",
  "Non-Vegetarian",
  "Rice",
  "Noodles",
  "Breads",
  "Desserts",
  "Beverages",
] as const;

export const ORDER_FLOW = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "COOKING",
  "READY",
  "COMPLETED",
] as const;

export const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SEATED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
] as const;

export const TABLE_STATUSES = ["AVAILABLE", "RESERVED", "OCCUPIED", "CLEANING"] as const;

export const rupees = (value: number | string) =>
  `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
