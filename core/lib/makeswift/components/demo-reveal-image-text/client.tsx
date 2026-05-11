type DemoRevealImageWithTextProps = {
  className?: string;
  eyebrow: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt: string;
  revealTitle: string;
  revealDescription: string;
};

export function DemoRevealImageWithText({
  className,
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  revealTitle,
  revealDescription,
}: DemoRevealImageWithTextProps) {
  return (
    <section className={className}>
      <div className="grid gap-6 rounded-xl border border-[hsl(var(--contrast-100))] bg-[hsl(var(--background))] p-6 md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <p className="mb-2 text-xs uppercase tracking-wide text-[hsl(var(--contrast-500))]">{eyebrow}</p>
          <h2 className="mb-3 text-3xl font-semibold leading-tight">{title}</h2>
          <p className="text-[hsl(var(--contrast-500))]">{description}</p>
        </div>

        <div className="group relative overflow-hidden rounded-lg bg-[hsl(var(--contrast-100))]">
          {imageSrc ? (
            <img
              alt={imageAlt}
              className="h-full min-h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={imageSrc}
            />
          ) : (
            <div className="flex h-full min-h-80 items-center justify-center p-4 text-center text-sm text-[hsl(var(--contrast-500))]">
              Add an image to enable reveal effect.
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
          <div className="absolute inset-x-0 bottom-0 translate-y-6 p-6 text-white opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="mb-2 text-lg font-semibold">{revealTitle}</p>
            <p className="text-sm text-white/90">{revealDescription}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
