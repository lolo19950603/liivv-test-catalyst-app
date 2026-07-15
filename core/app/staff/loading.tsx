export default function StaffLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f5f2ed] px-4">
      <span
        aria-hidden
        className="inline-block size-10 animate-spin rounded-full border-[3px] border-[#e0d9ce] border-b-[#6b7f5c]"
      />
      <p className="text-sm text-[#6b6560]">Loading…</p>
    </div>
  );
}
