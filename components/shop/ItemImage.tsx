import Image from "next/image";

export function ItemImage({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
        <span className="text-xs">No photo</span>
      </div>
    );
  }
  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
      <Image src={src} alt={alt} fill sizes="96px" className="object-cover" />
    </div>
  );
}
