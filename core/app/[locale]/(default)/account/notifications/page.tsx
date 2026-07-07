import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

/** Legacy Hydrogen route — notifications live on the account dashboard. */
export default async function AccountNotificationsRedirect({ params }: Props) {
  await params;
  redirect('/account/dashboard/');
}
