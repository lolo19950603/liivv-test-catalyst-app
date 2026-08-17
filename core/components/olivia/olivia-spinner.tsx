'use client';

import { OliviaFigure } from './olivia-figure';

export function OliviaSpinner({
  caption = 'Olivia is on it…',
  size = 'lg',
}: {
  caption?: string;
  size?: 'md' | 'lg' | 'xl';
}) {
  return (
    <div aria-busy="true" aria-live="polite" className="olivia-loading-screen" role="status">
      <OliviaFigure alt="" mood="loading" size={size} />
      <p className="olivia-loading-screen__caption">{caption}</p>
    </div>
  );
}
