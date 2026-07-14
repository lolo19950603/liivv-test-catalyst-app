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

function phaseLabel(phase: VoiceChatPhase, voiceChatActive: boolean): string {
  if (!voiceChatActive) {
    return 'Voice chat';
  }

  if (phase === 'listening') {
    return 'Listening… tap when done';
  }

  if (phase === 'thinking') {
    return 'Thinking…';
  }

  if (phase === 'speaking') {
    return 'Speaking…';
  }

  return 'Your turn — tap to talk';
}

export function ChatVoiceControls({
  enabled,
  disabled,
  compact,
  micSupported,
  recording,
  transcribing,
  speaking,
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
  voiceChatActive: boolean;
  voicePhase: VoiceChatPhase;
  onVoiceChatPrimaryAction: () => void;
  onEndVoiceChat: () => void;
}) {
  if (!enabled) {
    return null;
  }

  const busyThinking = Boolean(disabled) || transcribing || speaking;
  const primaryDisabled = !micSupported || (voiceChatActive && busyThinking && !recording);
  const buttonClass = compact
    ? 'inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium transition disabled:opacity-50'
    : 'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium transition disabled:opacity-50';

  const activeClass = recording
    ? 'border border-red-300 bg-red-50 text-red-700'
    : voiceChatActive
      ? 'border border-[#8a9a7b] bg-[#f4f7f0] text-[#375a37]'
      : 'border border-[#d8d1c6] bg-white text-[#2c2a26] hover:bg-[#f7f4ef]';

  return (
    <div className={`flex shrink-0 items-center gap-2 ${compact ? '' : 'flex-wrap'}`}>
      <button
        aria-label={phaseLabel(voicePhase, voiceChatActive)}
        aria-pressed={voiceChatActive}
        className={`${buttonClass} ${activeClass} ${compact ? 'min-w-11' : ''}`}
        disabled={primaryDisabled}
        onClick={onVoiceChatPrimaryAction}
        title={
          !micSupported
            ? 'Voice chat is not supported in this browser'
            : phaseLabel(voicePhase, voiceChatActive)
        }
        type="button"
      >
        {transcribing || (voiceChatActive && disabled && !recording && !speaking) ? (
          <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-current" />
        ) : (
          <MicIcon />
        )}
        {!compact || voiceChatActive ? (
          <span className={compact ? 'max-w-[7.5rem] truncate text-xs' : ''}>
            {voiceChatActive
              ? recording
                ? 'Done'
                : speaking
                  ? 'Speaking'
                  : transcribing || disabled
                    ? 'Wait'
                    : 'Talk'
              : 'Voice chat'}
          </span>
        ) : null}
      </button>

      {voiceChatActive ? (
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
      ) : null}
    </div>
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
}) {
  if (!enabled || !voiceChatActive) {
    return null;
  }

  return (
    <p className="text-sm text-[#375a37]" role="status">
      {phaseLabel(voicePhase, true)}
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
