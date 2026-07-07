import { PropsWithChildren } from 'react';
import { redirect } from 'next/navigation';

import { getOnboardingCustomer } from './page-data';

export default async function OnboardingLayout({ children }: PropsWithChildren) {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    redirect('/login?redirectTo=/account/onboarding/profile');
  }

  return (
    <div className="liivv-onboarding min-h-screen bg-[#f5f2ed] py-10">
      <div className="mx-auto w-full max-w-4xl px-4">{children}</div>
    </div>
  );
}
