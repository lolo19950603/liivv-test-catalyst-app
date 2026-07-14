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

function PhoneHangupIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M6 9.5c2.8-1.6 9.2-1.6 12 0M8.2 11.8 6.5 14.8M15.8 11.8l1.7 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function phaseLabel(phase: VoiceChatPhase, voiceChatActive: boolean, heardSpeech: boolean): string {
  if (!voiceChatActive) {
    return 'Voice chat';
  }

  if (phase === 'listening') {
    return heardSpeech ? 'Listening… pause when finished' : 'Listening… just start talking';
  }

  if (phase === 'thinking') {
    return 'Thinking…';
  }

  if (phase === 'speaking') {
    return 'Speaking…';
  }

  return 'Connecting…';
}

export function ChatVoiceControls({
  enabled,
  compact,
  micSupported,
  recording,
  transcribing,
  speaking,
  heardSpeech,
  voiceChatActive,
  voicePhase,
  onVoiceChatPrimaryAction,
  onEndVoiceChat,
}: {
  enabled: boolean;
  disabled?: boolean;
  compact?: boolean;
  micSupported: boolean;
  recording: boolean;
  transcribing: boolean;
  speaking: boolean;
  heardSpeech: boolean;
  voiceChatActive: boolean;
  voicePhase: VoiceChatPhase;
  onVoiceChatPrimaryAction: () => void;
  onEndVoiceChat: () => void;
}) {
  if (!enabled) {
    return null;
  }

  const buttonClass = compact
    ? 'inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium transition disabled:opacity-50'
    : 'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium transition disabled:opacity-50';

  if (voiceChatActive) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <div
          aria-live="polite"
          className={`${buttonClass} ${
            recording
              ? 'border border-red-300 bg-red-50 text-red-700'
              : 'border border-[#8a9a7b] bg-[#f4f7f0] text-[#375a37]'
          } ${compact ? 'min-w-11' : ''}`}
        >
          {transcribing || speaking || (!recording && voicePhase === 'thinking') ? (
            <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-current" />
          ) : (
            <MicIcon className={recording && heardSpeech ? 'animate-pulse' : undefined} />
          )}
          {!compact ? (
            <span>
              {recording ? 'Listening' : speaking ? 'Speaking' : transcribing ? 'Thinking' : 'Voice'}
            </span>
          ) : (
            <span className="max-w-[5.5rem] truncate text-xs">
              {recording ? 'Live' : speaking ? 'Reply' : 'Wait'}
            </span>
          )}
        </div>
        <button
          aria-label="End voice chat"
          className={`${buttonClass} border border-[#d8d1c6] bg-white text-[#2c2a26] hover:bg-[#f7f4ef] ${compact ? 'w-11 px-0' : ''}`}
          onClick={onEndVoiceChat}
          title="End voice chat"
          type="button"
        >
          <PhoneHangupIcon />
          {compact ? null : <span>End</span>}
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        aria-label="Start voice chat"
        className={`${buttonClass} border border-[#d8d1c6] bg-white text-[#2c2a26] hover:bg-[#f7f4ef]`}
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
        <span className={compact ? 'text-xs' : undefined}>Voice chat</span>
      </button>
    </div>
  );
}

export function ChatVoiceStatus({
  enabled,
  voiceChatActive,
  voicePhase,
  heardSpeech,
}: {
  enabled: boolean;
  voiceChatActive: boolean;
  voicePhase: VoiceChatPhase;
  heardSpeech: boolean;
}) {
  if (!enabled || !voiceChatActive) {
    return null;
  }

  return (
    <p className="min-w-0 flex-1 text-sm text-[#375a37]" role="status">
      {phaseLabel(voicePhase, true, heardSpeech)}
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
