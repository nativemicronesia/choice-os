import Image from "next/image";
import { CupSoda, Sandwich, Soup, Utensils, type LucideIcon } from "lucide-react";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Local Specials": Utensils,
  "Burgers & Sandwiches": Sandwich,
  Sides: Soup,
  "Cold Drinks": CupSoda,
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
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-ocean-700 via-ocean-600 to-sunset-500 ${className}`}
    >
      {!compact && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-3 -right-2 select-none font-display text-5xl font-semibold text-white/10"
        >
          CF
        </span>
      )}
      <Icon
        className={`relative text-white/90 ${compact ? "h-4 w-4" : "h-8 w-8"}`}
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
  const boxClass = size === 48 ? "h-12 w-12 rounded-xl" : "h-24 w-24 rounded-2xl";
  if (!src) return <PlaceholderArt category={category} className={boxClass} compact={size === 48} />;
  return (
    <div className={`relative shrink-0 overflow-hidden bg-sand-100 ${boxClass}`}>
      <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" />
    </div>
  );
}
