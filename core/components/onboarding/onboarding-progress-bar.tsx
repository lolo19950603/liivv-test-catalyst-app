type Props = {
  current: number;
  total: number;
  label?: string;
};

function clampProgressPercent(current: number, total: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(total) || total <= 0) return 1;
  const ratio = current / total;
  const pct = Math.round(ratio * 100);
  return Math.min(100, Math.max(1, pct));
}

export function OnboardingProgressBar({
  current,
  total,
  label = 'Onboarding progress',
}: Props) {
  const percent = clampProgressPercent(current, total);
  return (
    <div className="rounded-xl border border-[#e5dfd5] bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">{label}</p>
        <p className="text-xs font-semibold text-[#5a6d4d]">{percent}%</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#ede9e1]">
        <div
          className="h-full rounded-full bg-[#6b7f5c] transition-[width] duration-200"
          style={{width: `${percent}%`}}
          aria-hidden
        />
      </div>
    </div>
  );
}
