export function callNotificationApiMock(_arg: string) {
  return Promise.resolve();
}

export function createBrokenNotifyingCallback(failureAttempts: number) {
  let attempt = 0;
  return async function brokenNotifyingCallback() {
    if (attempt < failureAttempts) {
      attempt++;
      throw new Error('error');
    }
  };
}
