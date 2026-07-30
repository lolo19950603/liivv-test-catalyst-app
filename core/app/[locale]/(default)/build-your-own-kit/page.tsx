import { redirect } from 'next/navigation';

/**
 * Legacy DIY kit builder route. Curated kits replaced free-form building.
 */
export default function LegacyBuildYourOwnKitRedirect() {
  redirect('/kit/first-cycle-starter-kit');
}
