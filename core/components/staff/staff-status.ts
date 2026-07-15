const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending review',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
  active: 'Active',
  refill_processing: 'Refill processing',
  completed: 'Completed',
  setup_in_progress: 'Setup in progress',
  needs_info: 'Needs info',
};

export function formatStaffStatusLabel(value: string | null | undefined): string {
  const raw = String(value ?? '').trim();

  if (!raw) {
    return '—';
  }

  const key = raw.toLowerCase();

  if (STATUS_LABELS[key]) {
    return STATUS_LABELS[key];
  }

  return raw
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/** Soft badge tones for queue pills. */
export function staffStatusBadgeClass(value: string | null | undefined): string {
  const key = String(value ?? '').trim().toLowerCase();

  if (key === 'approved' || key === 'active' || key === 'completed') {
    return 'rounded-full bg-[#e8f2e8] px-2.5 py-1 text-xs font-medium text-[#2d4a2d]';
  }

  if (key === 'rejected' || key === 'expired') {
    return 'rounded-full bg-[#fce8e6] px-2.5 py-1 text-xs font-medium text-[#8a2f28]';
  }

  if (key === 'refill_processing' || key === 'setup_in_progress') {
    return 'rounded-full bg-[#e8eef8] px-2.5 py-1 text-xs font-medium text-[#2f4a7a]';
  }

  // pending_review, pending, needs_info, default
  return 'rounded-full bg-[#fff4d6] px-2.5 py-1 text-xs font-medium text-[#9a6b00]';
}
