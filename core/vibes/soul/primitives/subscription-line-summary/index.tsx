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
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--primary,hsl(var(--primary)))]">
        {badge}
      </p>
      {details?.map((detail) => (
        <p
          className="mt-0.5 text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]"
          key={detail}
        >
          {detail}
        </p>
      ))}
    </div>
  );
}
