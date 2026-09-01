interface SubscriptionLineSummaryProps {
  badge: string;
  details?: string[];
  className?: string;
}

export function SubscriptionLineSummary({
  badge,
  details,
  className,
}: SubscriptionLineSummaryProps) {
  return (
    <div
      className={`rounded-lg border border-[var(--store-border,hsl(var(--contrast-300)))] px-3 py-2.5 ${className ?? ''}`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[rgb(var(--color-highlight,142_165_141))]">
        {badge}
      </p>
      {details?.map((detail) => (
        <p
          className="mt-0.5 text-sm text-[var(--store-secondary-text,hsl(var(--contrast-500)))]"
          key={detail}
        >
          {detail}
        </p>
      ))}
    </div>
  );
}
