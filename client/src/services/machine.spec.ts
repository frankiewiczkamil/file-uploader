import { fileUploadCoordinatorMachine } from './machine';
import { assert, describe, it } from 'vitest';
import { interpret } from 'xstate';
import { WithDestinationPath } from './UploadCoordinatorMachine';
import { createBrokenUploadFunctionCallback, createUploadFileEffectMock } from './upload/effects/uploadFileMock';

const destinationPath = 'mocked path';
const FAILURE_ATTEMPTS = 3;

async function fetchDestinationPath() {
  return { path: destinationPath };
}

async function callNotificationApi(_arg: string) {
  await Promise.resolve();
}

function createBrokenFetchDestinationPathCallback() {
  let attempt = 0;
  return async function brokenFetchDestinationPathCallback() {
    if (attempt < FAILURE_ATTEMPTS) {
      attempt++;
      throw new Error('error');
    } else {
      return { path: destinationPath };
    }
  };
}

function createBrokenNotifyingCallback() {
  let attempt = 0;
  return async function brokenNotifyingCallback() {
    if (attempt < FAILURE_ATTEMPTS) {
      attempt++;
      throw new Error('error');
    }
  };
}

describe(
  'coordinator machine',
  () => {
    it('should go through all the states when there is no failure in sub machines', async () => {
      let uploadingCtx;
      let notifyingCtx;
      const machineDefinition = fileUploadCoordinatorMachine(fetchDestinationPath, createUploadFileEffectMock(), callNotificationApi);
      await new Promise((resolve) => {
        interpret(machineDefinition)
          .onTransition((state, _event) => {
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

    it('should be able to retry on fetching destination path failure', async () => {
      const machineDefinition = fileUploadCoordinatorMachine(createBrokenFetchDestinationPathCallback(), createUploadFileEffectMock(), callNotificationApi);
      await new Promise((resolve) => {
        const interpretedMachine = interpret(machineDefinition)
          .onTransition((state, _event) => {
            if (state.value === 'done') {
              resolve(undefined);
            }
          })
          .start();
        for (let i = 0; i < FAILURE_ATTEMPTS; i++) {
          setImmediate(() => interpretedMachine.send({ type: 'RETRY_REQUESTED' }));
        }
      });
    });

    it('should be able to retry on uploading file failure', async () => {
      const machineDefinition = fileUploadCoordinatorMachine(fetchDestinationPath, createBrokenUploadFunctionCallback(FAILURE_ATTEMPTS), callNotificationApi);
      await new Promise((resolve) => {
        const interpretedMachine = interpret(machineDefinition)
          .onTransition((state, _event) => {
            if (state.value === 'done') {
              resolve(undefined);
            }
          })
          .start();
        for (let i = 0; i < FAILURE_ATTEMPTS; i++) {
          setImmediate(() => interpretedMachine.send('RETRY_REQUESTED'));
        }
      });
    });

    it('should be able to retry on notifying failure', async () => {
      const machineDefinition = fileUploadCoordinatorMachine(fetchDestinationPath, createUploadFileEffectMock(), createBrokenNotifyingCallback());
      await new Promise((resolve) => {
        const interpretedMachine = interpret(machineDefinition)
          .onTransition((state, _event) => {
            if (state.value === 'done') {
              resolve(undefined);
            }
          })
          .start();
        for (let i = 0; i < FAILURE_ATTEMPTS; i++) {
          setImmediate(() => interpretedMachine.send('RETRY_REQUESTED'));
        }
      });
    });
  },
  { timeout: 10 }
);
