import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ setup?: string }>;
}

export default async function OnboardingHealthProfileRedirect({ searchParams }: Props) {
  const { setup } = await searchParams;

  redirect(setup === '1' ? '/account/health-profile?setup=1' : '/account/health-profile');
}
