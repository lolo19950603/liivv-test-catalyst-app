'use client';

import { useRef, type FormEvent, type KeyboardEvent } from 'react';

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

function WaveformIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" height="18" viewBox="0 0 24 24" width="18">
      <rect height="8" rx="1" width="2" x="5" y="8" />
      <rect height="14" rx="1" width="2" x="9" y="5" />
      <rect height="10" rx="1" width="2" x="13" y="7" />
      <rect height="16" rx="1" width="2" x="17" y="4" />
    </svg>
  );
}

function SendArrowIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M12 19V5M6.5 10.5 12 5l5.5 5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M5.5 12.5 10 17l8.5-9.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function DictateListeningStatus() {
  return (
    <div
      aria-label="Listening"
      className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden px-1 py-2"
      role="status"
    >
      <div aria-hidden="true" className="flex min-w-0 flex-1 items-center gap-[3px] overflow-hidden">
        {Array.from({ length: 28 }, (_, index) => (
          <span
            className="h-1 w-1 shrink-0 rounded-full bg-[#8a8176]"
            key={index}
            style={{
              animation: 'chat-dictate-dot 1.15s ease-in-out infinite',
              animationDelay: `${(index % 10) * 0.09}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes chat-dictate-dot {
          0%, 100% { opacity: 0.2; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

const iconButtonClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#2c2a26] transition hover:bg-black/5 disabled:opacity-40';

const primaryButtonClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2c2a26] shadow-sm ring-1 ring-black/5 transition hover:bg-[#faf8f5] disabled:opacity-40';

export function ChatComposer({
  draft,
  onDraftChange,
  onSubmit,
  disabled,
  placeholder,
  multiline = false,
  voiceEnabled = false,
  micSupported = false,
  dictateActive = false,
  transcribing = false,
  onDictateToggle,
  onDictateCancel,
  onDictateConfirm,
  onStartVoiceChat,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
  placeholder: string;
  multiline?: boolean;
  voiceEnabled?: boolean;
  micSupported?: boolean;
  dictateActive?: boolean;
  transcribing?: boolean;
  onDictateToggle?: () => void;
  onDictateCancel?: () => void;
  onDictateConfirm?: () => void;
  onStartVoiceChat?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasText = draft.trim().length > 0;
  const showVoicePrimary = voiceEnabled && !hasText;
  const inputLocked = Boolean(disabled || dictateActive || transcribing);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) {
    if (multiline && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (hasText && !disabled && !dictateActive && !transcribing) {
        formRef.current?.requestSubmit();
      }
    }
  }

  function handlePrimaryAction() {
    if (showVoicePrimary) {
      onStartVoiceChat?.();
      return;
    }

    formRef.current?.requestSubmit();
  }

  const fieldClassName =
    'min-w-0 flex-1 border-0 bg-transparent px-1 py-2 text-sm text-[#2c2a26] outline-none placeholder:text-[#8a8176] disabled:opacity-60';

  return (
    <form className="w-full" onSubmit={onSubmit} ref={formRef}>
      <input name="intent" type="hidden" value="send" />
      <div className="flex items-center gap-0.5 rounded-full bg-[#f0ebe3] py-1 pl-4 pr-1">
        {dictateActive || transcribing ? (
          <>
            {transcribing ? (
              <p className="min-w-0 flex-1 px-1 py-2 text-sm text-[#8a8176]">Transcribing…</p>
            ) : (
              <DictateListeningStatus />
            )}
            <button
              aria-label="Cancel dictation"
              className={iconButtonClass}
              disabled={Boolean(disabled) || transcribing}
              onClick={onDictateCancel}
              title="Cancel dictation"
              type="button"
            >
              <CloseIcon />
            </button>
            <button
              aria-label="Confirm dictation"
              className={primaryButtonClass}
              disabled={Boolean(disabled) || transcribing}
              onClick={onDictateConfirm}
              title="Use what I said"
              type="button"
            >
              <CheckIcon />
            </button>
          </>
        ) : (
          <>
            {multiline ? (
              <textarea
                className={`${fieldClassName} max-h-28 min-h-10 resize-none leading-5`}
                disabled={inputLocked}
                maxLength={8000}
                name="body"
                onChange={(event) => onDraftChange(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={1}
                value={draft}
              />
            ) : (
              <input
                className={fieldClassName}
                disabled={inputLocked}
                maxLength={8000}
                name="body"
                onChange={(event) => onDraftChange(event.target.value)}
                placeholder={placeholder}
                type="text"
                value={draft}
              />
            )}

            {voiceEnabled ? (
              <button
                aria-label="Dictate"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#8a8176] transition hover:bg-black/5 hover:text-[#2c2a26] disabled:opacity-40"
                disabled={Boolean(disabled) || !micSupported || transcribing}
                onClick={onDictateToggle}
                title={
                  !micSupported
                    ? 'Dictation is not supported in this browser'
                    : 'Dictate into the message'
                }
                type="button"
              >
                <MicIcon />
              </button>
            ) : null}

            <button
              aria-label={showVoicePrimary ? 'Start voice chat' : 'Send message'}
              className={primaryButtonClass}
              disabled={
                showVoicePrimary
                  ? Boolean(disabled) || !micSupported || transcribing
                  : Boolean(disabled) || !hasText || transcribing
              }
              onClick={handlePrimaryAction}
              title={
                showVoicePrimary
                  ? !micSupported
                    ? 'Voice chat is not supported in this browser'
                    : 'Start continuous voice chat'
                  : 'Send message'
              }
              type="button"
            >
              {showVoicePrimary ? <WaveformIcon /> : <SendArrowIcon />}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
