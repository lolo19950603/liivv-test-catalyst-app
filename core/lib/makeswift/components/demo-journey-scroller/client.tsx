interface JourneySection {
  name?: string;
  eyebrow: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt: string;
  leftContent?: React.ReactNode;
}

interface DemoJourneyScrollerProps {
  className?: string;
  heading: string;
  sections?: JourneySection[];
}

export function DemoJourneyScroller({ className, heading, sections }: DemoJourneyScrollerProps) {
  return (
    <section className={className}>
      <div className="mb-6">
        <p className="mb-2 text-sm uppercase tracking-wide text-[hsl(var(--contrast-500))]">
          Horizontal journey
        </p>
        <h2 className="text-3xl font-semibold leading-tight">{heading}</h2>
      </div>

      {!sections || sections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[hsl(var(--contrast-200))] bg-[hsl(var(--contrast-100))] p-6 text-sm text-[hsl(var(--contrast-500))]">
          Add at least one section in the Journey Scroller settings.
        </div>
      ) : (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
          {sections.map((section, index) => (
            <article
              className="grid w-full min-w-full shrink-0 snap-start gap-4 rounded-xl border border-[hsl(var(--contrast-100))] bg-[hsl(var(--background))] p-6 md:grid-cols-2"
              key={`${section.name ?? 'section'}-${index}`}
            >
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-[hsl(var(--contrast-500))]">
                  {section.eyebrow}
                </p>
                <h3 className="mb-3 text-2xl font-semibold leading-tight">{section.title}</h3>
                <p className="mb-4 text-[hsl(var(--contrast-500))]">{section.description}</p>

                <div className="rounded-md border border-dashed border-[hsl(var(--contrast-200))] bg-[hsl(var(--contrast-100))] p-4">
                  {section.leftContent ?? (
                    <p className="text-sm text-[hsl(var(--contrast-500))]">
                      Add additional content blocks for this section on the left side.
                    </p>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-[hsl(var(--contrast-100))]">
                {section.imageSrc ? (
                  <img
                    alt={section.imageAlt}
                    className="h-full min-h-64 w-full object-cover"
                    src={section.imageSrc}
                  />
                ) : (
                  <div className="flex h-full min-h-64 items-center justify-center p-4 text-center text-sm text-[hsl(var(--contrast-500))]">
                    Add an image for this section.
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
