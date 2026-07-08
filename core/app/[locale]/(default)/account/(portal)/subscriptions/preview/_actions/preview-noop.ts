'use server';

export async function previewNoopAction(): Promise<void> {
  // Static preview only — buttons are non-functional.
}

export async function previewNoopSubscriptionAction(
  _subscriptionId: string,
  _cancellationReason?: string,
): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}
