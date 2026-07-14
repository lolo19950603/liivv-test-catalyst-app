'use client';

import type { VoiceChatPhase } from '~/components/virtual-care/use-chat-voice';

function MicIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M12 15.5a3.5 3.5 0 0 0 3.5-3.5V7a3.5 3.5 0 1 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v2.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function voiceChatStatusLabel(phase: VoiceChatPhase): string {
  if (phase === 'listening') {
    return 'Listening…';
  }

  if (phase === 'thinking') {
    return 'Getting a reply…';
  }

  if (phase === 'speaking') {
    return 'Playing reply…';
  }

  return 'Starting…';
}

export function ChatVoiceControls({
  enabled,
  compact,
  micSupported,
  voiceChatActive,
  onVoiceChatPrimaryAction,
  onEndVoiceChat,
}: {
  enabled: boolean;
  disabled?: boolean;
  compact?: boolean;
  micSupported: boolean;
  recording?: boolean;
  transcribing?: boolean;
  speaking?: boolean;
  heardSpeech?: boolean;
  voiceChatActive: boolean;
  voicePhase?: VoiceChatPhase;
  onVoiceChatPrimaryAction: () => void;
  onEndVoiceChat: () => void;
}) {
  if (!enabled) {
    return null;
  }

  const buttonClass = compact
    ? 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d8d1c6] bg-white text-[#2c2a26] transition hover:bg-[#f7f4ef] disabled:opacity-50'
    : 'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#d8d1c6] bg-white px-3 text-sm font-medium text-[#2c2a26] transition hover:bg-[#f7f4ef] disabled:opacity-50';

  if (voiceChatActive) {
    return (
      <button
        aria-label="End voice chat"
        className={buttonClass}
        onClick={onEndVoiceChat}
        title="End voice chat"
        type="button"
      >
        <CloseIcon />
        {compact ? null : <span>End</span>}
      </button>
    );
  }

  return (
    <button
      aria-label="Start voice chat"
      className={
        compact
          ? buttonClass
          : 'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#d8d1c6] bg-white px-3 text-sm font-medium text-[#2c2a26] transition hover:bg-[#f7f4ef] disabled:opacity-50'
      }
      disabled={!micSupported}
      onClick={onVoiceChatPrimaryAction}
      title={
        !micSupported
          ? 'Voice chat is not supported in this browser'
          : 'Start continuous voice chat'
      }
      type="button"
    >
      <MicIcon />
      {compact ? null : <span>Voice chat</span>}
    </button>
  );
}

export function ChatVoiceStatus({
  enabled,
  voiceChatActive,
  voicePhase,
}: {
  enabled: boolean;
  voiceChatActive: boolean;
  voicePhase: VoiceChatPhase;
  heardSpeech?: boolean;
}) {
  if (!enabled || !voiceChatActive) {
    return null;
  }

  return (
    <p className="min-w-0 flex-1 text-sm text-[#375a37]" role="status">
      {voiceChatStatusLabel(voicePhase)}
    </p>
  );
}

export function ChatSpeakMessageButton({
  enabled,
  label = 'Listen',
  onSpeak,
}: {
  enabled: boolean;
  label?: string;
  onSpeak: () => void;
}) {
  if (!enabled) {
    return null;
  }

  return (
    <button
      className="mt-1 text-[10px] font-medium uppercase tracking-wide opacity-80 underline-offset-2 hover:underline"
      onClick={onSpeak}
      type="button"
    >
      {label}
    </button>
  );
}
