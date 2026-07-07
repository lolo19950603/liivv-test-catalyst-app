import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { VirtualCareChatClient } from '~/components/virtual-care/virtual-care-chat-client';

import { getVirtualCareChatData } from '../../pharmacy/page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  setRequestLocale(locale);

  return { title: 'Virtual care chat' };
}

export default async function VirtualCareChatPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const data = await getVirtualCareChatData();

  if (!data) {
    redirect('/login?redirectTo=/account/virtual-care/chat');
  }

  return (
    <VirtualCareChatClient
      conversationId={data.conversationId}
      customerLeftAt={data.customerLeftAt ?? null}
      loadError={null}
      messages={data.messages}
      staffClosedAt={data.staffClosedAt ?? null}
      supabaseReady={data.supabaseReady}
    />
  );
}
