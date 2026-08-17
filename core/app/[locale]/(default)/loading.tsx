import { OliviaSpinner } from '~/components/olivia/olivia-spinner';

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
      <OliviaSpinner caption="Olivia is fetching that…" />
    </div>
  );
}
