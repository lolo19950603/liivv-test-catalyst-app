import { Spinner } from '@/vibes/soul/primitives/spinner';

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16">
      <Spinner loadingAriaLabel="Loading page" size="md" />
      <p className="text-sm text-[#6b6560]">Loading page…</p>
    </div>
  );
}
