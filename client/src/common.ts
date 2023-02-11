export async function isPending(testedPromise: Promise<any>) {
  const definitelyDifferentThing = {};
  const winnerResult = await Promise.race([testedPromise, Promise.resolve(definitelyDifferentThing)]);
  return winnerResult === definitelyDifferentThing;
}

export type RetryRequested = { type: 'RETRY_REQUESTED' };
export type CancelRequested = { type: 'CANCEL_REQUESTED' };
