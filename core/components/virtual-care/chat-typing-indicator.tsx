'use client';

export function ChatTypingIndicator({
  label = 'Store assistant',
}: {
  label?: string;
}) {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label={`${label} is typing`}>
      <div className="max-w-[88%] rounded-2xl border border-[#c8d4bc] bg-[#f4f7f0] px-3 py-2.5 text-sm text-[#2c2a26]">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">
          {label}
        </p>
        <div className="flex items-center gap-1.5 px-0.5 py-0.5">
          <span className="text-xs text-[#5c564c]">Typing</span>
          <span className="size-1.5 animate-bounce rounded-full bg-[#6b7f5c] [animation-delay:0ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-[#6b7f5c] [animation-delay:150ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-[#6b7f5c] [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
