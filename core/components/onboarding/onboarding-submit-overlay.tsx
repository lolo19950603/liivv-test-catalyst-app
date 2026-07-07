type OnboardingSubmitOverlayProps = {
  visible: boolean;
  message?: string;
};

export function OnboardingSubmitOverlay({
  visible,
  message = 'Saving your progress...',
}: OnboardingSubmitOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#faf8f3]/75 backdrop-blur-[1px]"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 rounded-xl border border-[#e0d9ce] bg-white px-4 py-3 text-sm text-[#2c2a26] shadow-sm">
        <span
          className="inline-block size-4 animate-spin rounded-full border-2 border-[#6b7f5c] border-t-transparent"
          aria-hidden
        />
        <span>{message}</span>
      </div>
    </div>
  );
}
