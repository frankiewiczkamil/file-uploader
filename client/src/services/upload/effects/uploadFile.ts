import axios from 'axios';

export type ProgressListener = (progress: number | undefined) => void;

export function createUploadFileEffect(file: File, onProgressChange: ProgressListener) {
  let controller = new AbortController();
  const getCurrentSignalRef = () => controller.signal;
  return {
    run: async function uploadFile(path: string) {
      const body = new FormData();
      body.append('file', file);

      await axios.request({
        method: 'post',
        url: path,
        data: body,
        signal: getCurrentSignalRef(),
        onUploadProgress: ({ progress }) => onProgressChange && onProgressChange(progress),
      });
    },
    cancel: () => {
      controller.abort();
      controller = new AbortController();
    },
  };
}
