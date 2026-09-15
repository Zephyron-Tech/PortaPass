import Image from "next/image";

/**
 * One demo screenshot, rendered inside a fixed-aspect box with object-contain
 * so any consistently-sized export drops in without code changes.
 *
 * Until the real exports exist, `src` is left undefined and a neutral
 * placeholder of the same aspect renders instead — so the layout is already
 * final and nothing shifts when the images arrive.
 */
export function DeviceShot({
  src,
  alt,
  caption,
  className = "",
}: {
  src?: string;
  alt: string;
  caption: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-[2rem]">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 768px) 30vw, 80vw"
            className="object-contain"
          />
        ) : (
          <div
            aria-hidden
            className="h-full w-full rounded-[2rem] border border-dashed border-neutral-900/15 bg-neutral-900/[0.03]"
          />
        )}
      </div>
      <figcaption className="mt-4 text-center text-[13px] text-neutral-500">{caption}</figcaption>
    </figure>
  );
}
