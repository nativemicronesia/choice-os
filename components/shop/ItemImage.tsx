import Image from "next/image";
import { CupSoda, Sandwich, Soup, Utensils, type LucideIcon } from "lucide-react";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Local Specials": Utensils,
  "Burgers & Sandwiches": Sandwich,
  Sides: Soup,
  "Cold Drinks": CupSoda,
};

const CATEGORY_SURFACE: Record<string, string> = {
  "Local Specials": "bg-palm-50",
  "Burgers & Sandwiches": "bg-sunset-100",
  Sides: "bg-sand-100",
  "Cold Drinks": "bg-ocean-50",
};

export function PlaceholderArt({
  category,
  className = "h-24 w-24 rounded-2xl",
  compact = false,
}: {
  category?: string;
  className?: string;
  compact?: boolean;
}) {
  const Icon = (category && CATEGORY_ICON[category]) || Utensils;
  const surface = (category && CATEGORY_SURFACE[category]) || "bg-ocean-50";
  const ink = category === "Local Specials" ? "text-palm-700" : category === "Burgers & Sandwiches" ? "text-sunset-700" : category === "Sides" ? "text-ink-700" : "text-ocean-800";
  return (
    <div
      aria-hidden="true"
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${surface} ${className}`}
    >
      <Icon
        className={`relative ${ink} ${compact ? "h-4 w-4" : "h-8 w-8"}`}
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </div>
  );
}

export function ItemImage({
  src,
  alt,
  category,
  size = 96,
}: {
  src: string | null;
  alt: string;
  category?: string;
  size?: 48 | 96;
}) {
  const boxClass = size === 48 ? "h-12 w-12 rounded-xl" : "h-[76px] w-[76px] rounded-2xl sm:h-20 sm:w-20";
  if (!src) return <PlaceholderArt category={category} className={boxClass} compact={size === 48} />;
  return (
    <div className={`relative shrink-0 overflow-hidden bg-sand-100 ${boxClass}`}>
      <Image src={src} alt={alt} fill sizes={size === 48 ? "48px" : "80px"} className="object-cover" />
    </div>
  );
}
