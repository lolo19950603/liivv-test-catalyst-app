import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  setRequestLocale(locale);

  return { title: 'Live chat' };
}

/** Chat now lives in the site-wide floating widget — keep this route as a deep link. */
export default async function VirtualCareChatPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  redirect('/?chat=open');
}
