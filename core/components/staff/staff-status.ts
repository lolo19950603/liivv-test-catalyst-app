export type StaffWorklistBucket = 'needs_review' | 'in_progress' | 'closed';

const IN_PROGRESS_STATUSES = new Set(['refill_processing', 'setup_in_progress']);
const CLOSED_STATUSES = new Set(['approved', 'active', 'completed', 'rejected', 'expired']);

/** Groups existing statuses into the worklist filters. Unknown values stay in needs review. */
export function staffWorklistBucket(value: string | null | undefined): StaffWorklistBucket {
  const key = String(value ?? '').trim().toLowerCase();

  if (IN_PROGRESS_STATUSES.has(key)) {
    return 'in_progress';
  }

  if (CLOSED_STATUSES.has(key)) {
    return 'closed';
  }

  return 'needs_review';
}

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
    return 'rounded-full bg-[#b7e0b8] px-3 py-1 text-sm font-semibold text-[#145218]';
  }

  if (key === 'rejected' || key === 'expired') {
    return 'rounded-full bg-[#f6b8b4] px-3 py-1 text-sm font-semibold text-[#7a1d18]';
  }

  if (key === 'refill_processing' || key === 'setup_in_progress') {
    return 'rounded-full bg-[#b9d4f5] px-3 py-1 text-sm font-semibold text-[#163e78]';
  }

  // pending_review, pending, needs_info, default
  return 'rounded-full bg-[#ffd56a] px-3 py-1 text-sm font-semibold text-[#7a4a00]';
}
