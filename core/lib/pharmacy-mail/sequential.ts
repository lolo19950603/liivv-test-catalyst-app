/*
 * Runs async work one item after another (never in parallel), in order.
 * Graph allows only a few concurrent requests per mailbox, and the sync must
 * keep its order (delta pages, folders), so the mail code steps through lists
 * with this rather than Promise.all. `run` returning false stops early.
 */
export async function forEachSequential<T>(
  items: readonly T[],
  run: (item: T, index: number) => Promise<unknown>,
): Promise<void> {
  let stopped = false;

  await items.reduce<Promise<void>>(async (previous, item, index) => {
    await previous;

    if (stopped) {
      return;
    }

    stopped = (await run(item, index)) === false;
  }, Promise.resolve());
}
