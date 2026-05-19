'use client';

import { createContext } from 'react';

/**
 * When inside `SplittingBanner`, headline animation is driven by scroll reveal
 * instead of intersection observer. `null` = not in a splitting banner.
 */
export const SplittingBannerRevealContext = createContext<boolean | null>(null);
