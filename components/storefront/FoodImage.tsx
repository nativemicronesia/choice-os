import Image from "next/image";
import type { Tone } from "@/lib/storefront/catalog";

/**
 * Photo slot. Renders the supplied image, or a labeled placeholder sized for the
 * real photography. Parent controls the box (aspect ratio / size); this fills it.
 */
export function FoodImage({
  src,
  alt,
  label,
  tone = "ember",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  zoom = true,
  quiet = false,
}: {
  src: string | null;
  alt: string;
  label: string;
  tone?: Tone;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
  quiet?: boolean;
}) {
  if (src) {
    return (
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${zoom ? "sf-zoom" : ""}`} />
    );
  }
  return (
    <div className={`sf-ph sf-ph-${tone}`} aria-hidden="true">
      {!quiet && <span className="relative max-w-[55%] text-balance text-center text-[10px] font-semibold uppercase leading-snug tracking-[0.14em] opacity-80">
        Photo placeholder<br />{label}
      </span>}
    </div>
  );
}
