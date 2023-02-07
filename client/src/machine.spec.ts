import { fileUploadCoordinatorMachine, WithDestinationPath } from './machine';
import { assert, describe, test } from 'vitest';
import { interpret } from 'xstate';

const destinationPath = 'mocked path';

async function uploadFileMock(arg: string) {
  // console.log('uploadFileMock:', arg);
  await Promise.resolve();
}

async function fetchDestinationPath() {
  // console.log('fetchDestinationPath');
  return { path: destinationPath };
}

async function callNotificationApi(arg: string) {
  // console.log('callNotificationApi: ', arg);
  await Promise.resolve();
}

describe('main machine', () => {
  test('happy path', async () => {
    let uploadingCtx;
    let notifyingCtx;
    const machine = fileUploadCoordinatorMachine(fetchDestinationPath, uploadFileMock, callNotificationApi);
    await new Promise((resolve) => {
      interpret(machine)
        .onTransition((state, event) => {
          // console.log('[test][machine] changed state', state.value, 'state.context', state.context, 'event', event);

          if (state.value === 'uploadingFile') {
            uploadingCtx = (state.context as WithDestinationPath).destinationPath;
          }
          if (state.value === 'notifying') {
            notifyingCtx = (state.context as WithDestinationPath).destinationPath;
          }
          if (state.value === 'done') {
            resolve(undefined);
          }
        })
        .start();
    });
    assert.equal(uploadingCtx, destinationPath, 'uploading requires path');
    assert.equal(notifyingCtx, destinationPath, 'notifying requires path');
  });
});
