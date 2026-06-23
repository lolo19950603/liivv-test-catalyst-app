'use server';

export async function previewNoopAction(): Promise<void> {
  // Static preview only — buttons are non-functional.
}

export async function previewNoopSubscriptionAction(_subscriptionId: string): Promise<void> {
  // Static preview only — buttons are non-functional.
}
