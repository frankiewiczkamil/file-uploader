export type RetryRequested = { type: 'RETRY_REQUESTED' };
export type CancelRequested = { type: 'CANCEL_REQUESTED' };
export type SubMachineState = 'inProgress' | 'canceled' | 'done' | 'failed' | undefined;
