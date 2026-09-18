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
  loading = "lazy",
  reveal = true,
  sizes = "(min-width: 768px) 272px, 208px",
  onLoad,
}: {
  src?: string;
  alt: string;
  caption?: string;
  className?: string;
  loading?: "eager" | "lazy";
  reveal?: boolean;
  sizes?: string;
  onLoad?: () => void;
}) {
  return (
    <figure className={className} data-reveal={reveal ? "tall" : undefined}>
      <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-[2rem]">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            quality={90}
            loading={loading}
            onLoad={onLoad}
            className="object-contain"
          />
        ) : (
          <div
            aria-hidden
            className="h-full w-full rounded-[2rem] border border-dashed border-hairline-strong bg-black/[0.02]"
          />
        )}
      </div>
      {caption ? (
        <figcaption className="mt-4 text-center text-[14px] text-ink-3">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
