export function createFetchDestinationPatchMock(destinationPath: string) {
  return function fetchDestinationPath() {
    return Promise.resolve({ path: destinationPath });
  };
}

export function createBrokenFetchDestinationPathCallback(destinationPath: string, failureAttempts: number) {
  let attempt = 0;
  return async function brokenFetchDestinationPathCallback() {
    if (attempt < failureAttempts) {
      attempt++;
      throw new Error('error');
    } else {
      return { path: destinationPath };
    }
  };
}
