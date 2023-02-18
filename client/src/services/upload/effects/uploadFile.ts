export function createUploadFileEffect(file: File) {
  let controller = new AbortController();
  const getCurrentSignalRef = () => controller.signal;
  return {
    run: async function uploadFile(path: string) {
      const body = new FormData();
      body.append('file', file);

      await fetch(path, {
        method: 'POST',
        body,
        signal: getCurrentSignalRef(),
      });
    },
    cancel: () => {
      controller.abort();
      controller = new AbortController();
    },
  };
}
