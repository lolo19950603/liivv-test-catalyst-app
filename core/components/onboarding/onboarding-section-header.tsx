import type { ReactNode } from 'react';

export function OnboardingSectionHeader({
  kicker,
  title,
  titleBefore,
  titleAccent,
  description,
  centerOnMobile = false,
}: {
  kicker?: string;
  title?: ReactNode;
  titleBefore?: string;
  titleAccent?: string;
  description?: string;
  centerOnMobile?: boolean;
}) {
  const alignment = centerOnMobile ? 'text-center sm:text-left' : '';

  return (
    <header className={alignment}>
      {kicker ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">{kicker}</p>
      ) : null}
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#2c2a26]">
        {title ?? (
          <>
            {titleBefore}
            {titleAccent ? <span className="font-normal text-[#8E9E88]">{titleAccent}</span> : null}
          </>
        )}
      </h1>
      {description ? <p className="mt-2 max-w-2xl text-sm text-[#6b6560]">{description}</p> : null}
    </header>
  );
}
