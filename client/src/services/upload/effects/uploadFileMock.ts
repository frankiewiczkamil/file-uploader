export function createUploadFileEffectMock() {
  return {
    run: async function createUploadFileEffectMock(_arg: string) {
      await Promise.resolve();
    },
    cancel: () => {},
  };
}

export function createBrokenUploadFunctionCallback(failureAttempts: number) {
  let attempt = 0;
  return {
    run: async function brokenUploadFileCallback() {
      if (attempt < failureAttempts) {
        attempt++;
        throw new Error('error');
      }
    },
    cancel: () => {},
  };
}
