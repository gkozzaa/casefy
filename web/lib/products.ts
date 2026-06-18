// The 12 products a candidate can be interviewed about.
// The backend accepts any product string, so this list is purely the
// curated catalogue surfaced in the UI.

export interface Product {
  name: string;
  emoji: string;
  tagline: string;
  accent: string; // tailwind-friendly hex used for the card glow
}

export const PRODUCTS: Product[] = [
  { name: "Spotify", emoji: "🎧", tagline: "Audio streaming & discovery", accent: "#1DB954" },
  { name: "Netflix", emoji: "🎬", tagline: "Streaming & content", accent: "#E50914" },
  { name: "Airbnb", emoji: "🏠", tagline: "Travel marketplace", accent: "#FF5A5F" },
  { name: "Uber", emoji: "🚗", tagline: "Mobility & logistics", accent: "#FFFFFF" },
  { name: "Instagram", emoji: "📸", tagline: "Social & creators", accent: "#E1306C" },
  { name: "Notion", emoji: "📝", tagline: "Productivity & docs", accent: "#FFFFFF" },
  { name: "Duolingo", emoji: "🦉", tagline: "Learning & gamification", accent: "#58CC02" },
  { name: "Nubank", emoji: "💜", tagline: "Digital banking", accent: "#820AD1" },
  { name: "iFood", emoji: "🍔", tagline: "Food delivery", accent: "#EA1D2C" },
  { name: "WhatsApp", emoji: "💬", tagline: "Messaging at scale", accent: "#25D366" },
  { name: "Amazon", emoji: "📦", tagline: "E-commerce & logistics", accent: "#FF9900" },
  { name: "Tinder", emoji: "🔥", tagline: "Dating & matching", accent: "#FE3C72" },
];

export function findProduct(name: string | null | undefined): Product | undefined {
  if (!name) return undefined;
  return PRODUCTS.find((p) => p.name.toLowerCase() === name.toLowerCase());
}
