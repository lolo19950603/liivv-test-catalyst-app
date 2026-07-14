'use client';

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

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M4.5 9.5v5h3.2L12.5 18V6L7.7 9.5H4.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <path
        d="M15.2 9.2a3.2 3.2 0 0 1 0 5.6M17.6 7a5.6 5.6 0 0 1 0 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function ChatVoiceControls({
  enabled,
  disabled,
  compact,
  micSupported,
  recording,
  transcribing,
  speaking,
  speakReplies,
  onToggleRecording,
  onToggleSpeakReplies,
  onStopSpeaking,
}: {
  enabled: boolean;
  disabled?: boolean;
  compact?: boolean;
  micSupported: boolean;
  recording: boolean;
  transcribing: boolean;
  speaking: boolean;
  speakReplies: boolean;
  onToggleRecording: () => void;
  onToggleSpeakReplies: () => void;
  onStopSpeaking: () => void;
}) {
  if (!enabled) {
    return null;
  }

  const busy = Boolean(disabled) || transcribing;
  const buttonClass = compact
    ? 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d8d1c6] bg-white text-[#2c2a26] transition hover:bg-[#f7f4ef] disabled:opacity-50'
    : 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d8d1c6] bg-white text-[#2c2a26] transition hover:bg-[#f7f4ef] disabled:opacity-50';

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        aria-label={
          recording ? 'Stop recording' : transcribing ? 'Transcribing voice' : 'Record voice message'
        }
        aria-pressed={recording}
        className={`${buttonClass} ${recording ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
        disabled={busy || !micSupported}
        onClick={onToggleRecording}
        title={
          !micSupported
            ? 'Voice input is not supported in this browser'
            : recording
              ? 'Stop recording'
              : 'Speak your message'
        }
        type="button"
      >
        {transcribing ? (
          <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-current" />
        ) : (
          <MicIcon />
        )}
      </button>

      <button
        aria-label={speakReplies ? 'Turn off spoken replies' : 'Turn on spoken replies'}
        aria-pressed={speakReplies}
        className={`${buttonClass} ${speakReplies ? 'border-[#8a9a7b] bg-[#f4f7f0] text-[#375a37]' : ''}`}
        disabled={Boolean(disabled)}
        onClick={() => {
          if (speaking) {
            onStopSpeaking();
          }

          onToggleSpeakReplies();
        }}
        title={speakReplies ? 'Spoken replies on' : 'Hear assistant replies'}
        type="button"
      >
        <SpeakerIcon />
      </button>
    </div>
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
