'use client';

import { ReactRuntimeProvider, RootStyleRegistry, type SiteVersion } from '@makeswift/runtime/next';
import { useIsInBuilder } from '@makeswift/runtime/react';
import { useEffect } from 'react';

import { runtime } from '~/lib/makeswift/runtime';
import '~/lib/makeswift/components';

function MakeswiftBuilderChromeMarker({ children }: { children: React.ReactNode }) {
  const isInBuilder = useIsInBuilder();

  useEffect(() => {
    if (isInBuilder) {
      document.documentElement.setAttribute('data-makeswift-builder', '');
    } else {
      document.documentElement.removeAttribute('data-makeswift-builder');
    }
  }, [isInBuilder]);

  return <>{children}</>;
}

export function MakeswiftProvider({
  children,
  siteVersion,
}: {
  children: React.ReactNode;
  siteVersion: SiteVersion | null;
}) {
  return (
    <ReactRuntimeProvider
      apiOrigin={process.env.NEXT_PUBLIC_MAKESWIFT_API_ORIGIN}
      appOrigin={process.env.NEXT_PUBLIC_MAKESWIFT_APP_ORIGIN}
      runtime={runtime}
      siteVersion={siteVersion}
    >
      <RootStyleRegistry enableCssReset={false}>
        <MakeswiftBuilderChromeMarker>{children}</MakeswiftBuilderChromeMarker>
      </RootStyleRegistry>
    </ReactRuntimeProvider>
  );
}
