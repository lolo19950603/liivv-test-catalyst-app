'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import {
  virtualCareChatAction,
  type VirtualCareChatActionState,
} from '~/app/[locale]/(default)/account/(portal)/virtual-care/_actions/virtual-care-actions';
import { Link } from '~/components/link';
import { OnboardingSectionHeader } from '~/components/onboarding/onboarding-section-header';
import { ChatMessageBody } from '~/components/virtual-care/chat-message-body';
import {
  ChatSpeakMessageButton,
  ChatVoiceControls,
  ChatVoiceStatus,
} from '~/components/virtual-care/chat-voice-controls';
import { ChatSystemMessage } from '~/components/virtual-care/chat-system-message';
import { ChatTypingIndicator } from '~/components/virtual-care/chat-typing-indicator';
import { useChatOptimisticSend } from '~/components/virtual-care/use-chat-optimistic-send';
import { useChatVoice } from '~/components/virtual-care/use-chat-voice';
import type { ChatMessageRow } from '~/lib/supabase/chat-messages';

function messageBubbleClass(senderType: ChatMessageRow['sender_type']): string {
  if (senderType === 'customer') {
    return 'bg-[#6b7f5c] text-white';
  }

  if (senderType === 'bot') {
    return 'border border-[#c8d4bc] bg-[#f4f7f0] text-[#2c2a26]';
  }

  return 'border border-[#dcd6cc] bg-white text-[#2c2a26]';
}

function messageLabel(senderType: ChatMessageRow['sender_type']): string | null {
  if (senderType === 'bot') {
    return 'Store assistant';
  }

  if (senderType === 'staff') {
    return 'Care team';
  }

  return null;
}

export function VirtualCareChatClient({
  supabaseReady,
  conversationId,
  escalatedToPharmacistAt,
  botEnabled,
  careTeamActive,
  messages,
  loadError,
}: {
  supabaseReady: boolean;
  conversationId: string | null;
  escalatedToPharmacistAt: string | null;
  botEnabled: boolean;
  careTeamActive: boolean;
  messages: ChatMessageRow[];
  loadError: string | null;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const seededSpeakRef = useRef(false);
  const [sendState, sendAction, sendPending] = useActionState<
    VirtualCareChatActionState,
    FormData
  >(virtualCareChatAction, null);

  const assistantActive = botEnabled && !careTeamActive && !escalatedToPharmacistAt;

  const { draft, displayMessages, handleSendSubmit, inputLocked, sendMessage, setDraft, showTyping } =
    useChatOptimisticSend({
      assistantActive,
      conversationId,
      messages,
      sendAction,
      sendPending,
      sendState,
    });

  const voice = useChatVoice({
    enabled: assistantActive,
    disabled: inputLocked || Boolean(loadError),
    onTranscript: (text) => {
      setDraft((current) => {
        const trimmed = current.trim();

        return trimmed ? `${trimmed} ${text}` : text;
      });
    },
    onVoiceTurn: (text) => sendMessage(text),
  });

  const latestBot = [...displayMessages].reverse().find((m) => m.sender_type === 'bot');
  const autoSpeak = voice.speakReplies || voice.voiceChatActive;

  useEffect(() => {
    if (!supabaseReady || !conversationId) {
      return;
    }

    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    }, 15000);

    return () => window.clearInterval(id);
  }, [conversationId, router, supabaseReady]);

  useEffect(() => {
    const el = scrollRef.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [displayMessages.length, showTyping]);

  useEffect(() => {
    if (sendState?.ok) {
      router.refresh();
    }
  }, [router, sendState?.ok]);

  useEffect(() => {
    if (!assistantActive || !autoSpeak) {
      seededSpeakRef.current = false;
      return;
    }

    if (!seededSpeakRef.current) {
      voice.rememberExistingBotMessages(
        displayMessages.filter((m) => m.sender_type === 'bot').map((m) => m.id),
      );
      seededSpeakRef.current = true;
    }
  }, [assistantActive, autoSpeak]);

  useEffect(() => {
    if (!assistantActive || !autoSpeak || !latestBot || !seededSpeakRef.current) {
      return;
    }

    voice.maybeSpeakBotReply(latestBot.id, latestBot.body);
  }, [assistantActive, autoSpeak, latestBot?.body, latestBot?.id]);

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 pb-10">
      <OnboardingSectionHeader
        description={
          careTeamActive
            ? 'A care team member is in this conversation. They will reply here when available.'
            : assistantActive
              ? 'Ask about products, orders, prescriptions, or your account. Tap Voice chat to talk — for medication advice, a pharmacist will join the chat.'
              : 'Send updates and questions to your care team. Messages are saved so staff can follow up.'
        }
        kicker="Secure messaging"
        titleAccent={careTeamActive || !botEnabled ? 'team' : 'assistant'}
        titleBefore="Chat with our "
      />
      <Link className="text-sm font-medium text-[#375a37] hover:underline" href="/account/virtual-care">
        ‹ Virtual care
      </Link>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadError}
        </div>
      ) : null}

      {!supabaseReady ? (
        <div className="rounded-2xl border border-dashed border-[#c4b8a8] bg-[#faf8f5] px-6 py-8 text-sm text-[#5c564c]">
          <p className="font-medium text-[#2c2a26]">Chat storage is not configured</p>
          <p className="mt-2">Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {careTeamActive ? (
            <div className="rounded-lg border border-[#c5ccd4] bg-[#f4f6f8] px-4 py-3 text-sm">
              You&apos;re connected with a care team member.
            </div>
          ) : assistantActive ? (
            <div className="rounded-lg border border-[#d4dfc8] bg-[#f8faf6] px-4 py-3 text-sm text-[#3d4a36]">
              This assistant helps with store and account questions only — not medical advice. Tap
              Voice chat once, then talk naturally — pause when finished, and tap End to stop.
            </div>
          ) : escalatedToPharmacistAt ? (
            <div className="rounded-lg border border-[#d4dfc8] bg-[#f8faf6] px-4 py-3 text-sm text-[#3d4a36]">
              A pharmacist has been notified and will join this conversation.
            </div>
          ) : null}

          <div
            className="max-h-[min(420px,55vh)] space-y-3 overflow-y-auto rounded-xl border border-[#e5dfd5] bg-white p-4"
            ref={scrollRef}
          >
            {!conversationId && displayMessages.length === 0 ? (
              <p className="text-center text-sm text-[#8a8176]">
                No conversation yet — send a message below to start.
              </p>
            ) : null}
            {displayMessages.map((m) => {
              if (m.sender_type === 'system') {
                return <ChatSystemMessage body={m.body} key={m.id} />;
              }

              const alignEnd = m.sender_type === 'customer';

              return (
                <div
                  className={`flex ${alignEnd ? 'justify-end' : 'justify-start'}`}
                  key={m.id}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${messageBubbleClass(m.sender_type)}`}
                  >
                    {messageLabel(m.sender_type) ? (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">
                        {messageLabel(m.sender_type)}
                      </p>
                    ) : null}
                    <ChatMessageBody body={m.body} />
                    {m.sender_type === 'bot' && assistantActive ? (
                      <ChatSpeakMessageButton
                        enabled
                        onSpeak={() => {
                          void voice.speakText(m.body, m.id);
                        }}
                      />
                    ) : null}
                    <p className="mt-1 text-[10px] opacity-75">
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {showTyping ? <ChatTypingIndicator /> : null}
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={handleSendSubmit}
          >
            <input name="intent" type="hidden" value="send" />
            <textarea
              className="min-h-22 w-full resize-y rounded-xl border border-[#e0d9ce] px-3.5 py-2.5 text-sm"
              disabled={inputLocked || Boolean(loadError)}
              maxLength={8000}
              name="body"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={
                voice.voiceChatActive
                  ? voice.recording
                    ? voice.heardSpeech
                      ? 'Listening… pause when you are done'
                      : 'Listening… just start talking'
                    : voice.speaking
                      ? 'Assistant is speaking…'
                      : 'Thinking…'
                  : careTeamActive
                    ? 'Message the care team…'
                    : assistantActive
                      ? 'Ask the store assistant…'
                      : 'Type your message…'
              }
              rows={3}
              value={draft}
            />
            <div className="flex items-center gap-2 sm:flex-col sm:items-stretch">
              <ChatVoiceControls
                compact={false}
                enabled={assistantActive}
                heardSpeech={voice.heardSpeech}
                micSupported={voice.micSupported}
                onEndVoiceChat={voice.endVoiceChat}
                onVoiceChatPrimaryAction={voice.handleVoiceChatPrimaryAction}
                recording={voice.recording}
                speaking={voice.speaking}
                transcribing={voice.transcribing}
                voiceChatActive={voice.voiceChatActive}
                voicePhase={voice.voicePhase}
              />
              <button
                className="liivv-btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
                disabled={inputLocked || Boolean(loadError) || voice.voiceChatActive}
                type="submit"
              >
                Send
              </button>
            </div>
          </form>
          <ChatVoiceStatus
            enabled={assistantActive}
            heardSpeech={voice.heardSpeech}
            voiceChatActive={voice.voiceChatActive}
            voicePhase={voice.voicePhase}
          />
          {voice.voiceError ? <p className="text-sm text-red-700">{voice.voiceError}</p> : null}
          {sendState?.error ? <p className="text-sm text-red-700">{sendState.error}</p> : null}
        </div>
      )}
    </section>
  );
}
