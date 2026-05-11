import { setRequestLocale } from 'next-intl/server';

import { DemoJourneyScrollerSection } from '~/lib/makeswift/components/demo-journey-scroller';
import { DemoRevealImageWithTextSection } from '~/lib/makeswift/components/demo-reveal-image-text';
import { Slot } from '~/lib/makeswift/slot';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function DemoHybridPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <DemoJourneyScrollerSection />
      <DemoRevealImageWithTextSection />

      <Slot
        label="Demo hybrid top content"
        snapshotId="demo-hybrid-top-content"
        fallback={
          <section className="rounded-lg border border-dashed border-[hsl(var(--contrast-200))] bg-[hsl(var(--contrast-100))] p-6">
            <p className="text-sm text-[hsl(var(--contrast-500))]">
              Makeswift slot: add blocks here from the Makeswift editor.
            </p>
          </section>
        }
      />

      <section className="rounded-lg border border-[hsl(var(--contrast-100))] bg-[hsl(var(--background))] p-8">
        <h2 className="mb-2 text-xl font-medium">Another coded section</h2>
        <p className="text-[hsl(var(--contrast-500))]">
          Keep business logic, API data, and layout in code while letting content teams edit slot areas.
        </p>
      </section>

      <Slot
        label="Demo hybrid bottom content"
        snapshotId="demo-hybrid-bottom-content"
        fallback={
          <section className="rounded-lg border border-dashed border-[hsl(var(--contrast-200))] bg-[hsl(var(--contrast-100))] p-6">
            <p className="text-sm text-[hsl(var(--contrast-500))]">
              Second Makeswift slot for promos, banners, or custom blocks.
            </p>
          </section>
        }
      />
    </main>
  );
}
