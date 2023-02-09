import { fileUploadCoordinatorMachine, WithDestinationPath } from './machine';
import { assert, describe, it } from 'vitest';
import { interpret } from 'xstate';

const destinationPath = 'mocked path';
const FAILURE_ATTEMPTS = 3;

async function uploadFileMock(_arg: string) {
  await Promise.resolve();
}

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

function createBrokenUploadFunctionCallback() {
  let attempt = 0;
  return async function brokenUploadFileCallback() {
    if (attempt < FAILURE_ATTEMPTS) {
      attempt++;
      throw new Error('error');
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

describe('coordinator machine', () => {
  it('should go through all the states when there is no failure in sub machines', async () => {
    let uploadingCtx;
    let notifyingCtx;
    const machineDefinition = fileUploadCoordinatorMachine(fetchDestinationPath, uploadFileMock, callNotificationApi);
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
    const machineDefinition = fileUploadCoordinatorMachine(createBrokenFetchDestinationPathCallback(), uploadFileMock, callNotificationApi);
    await new Promise((resolve) => {
      const interpretedMachine = interpret(machineDefinition)
        .onTransition((state, _event) => {
          if (state.value === 'done') {
            resolve(undefined);
          }
        })
        .start();
      for (let i = 0; i < FAILURE_ATTEMPTS; i++) {
        setImmediate(() => interpretedMachine.send('RETRY_FETCHING_PATH_REQUESTED'));
      }
    });
  });

  it('should be able to retry on uploading file failure', async () => {
    const machineDefinition = fileUploadCoordinatorMachine(fetchDestinationPath, createBrokenUploadFunctionCallback(), callNotificationApi);
    await new Promise((resolve) => {
      const interpretedMachine = interpret(machineDefinition)
        .onTransition((state, _event) => {
          if (state.value === 'done') {
            resolve(undefined);
          }
        })
        .start();
      for (let i = 0; i < FAILURE_ATTEMPTS; i++) {
        setImmediate(() => interpretedMachine.send('RETRY_UPLOADING_REQUESTED'));
      }
    });
  });

  it('should be able to retry on notifying failure', async () => {
    const machineDefinition = fileUploadCoordinatorMachine(fetchDestinationPath, uploadFileMock, createBrokenNotifyingCallback());
    await new Promise((resolve) => {
      const interpretedMachine = interpret(machineDefinition)
        .onTransition((state, _event) => {
          if (state.value === 'done') {
            resolve(undefined);
          }
        })
        .start();
      for (let i = 0; i < FAILURE_ATTEMPTS; i++) {
        setImmediate(() => interpretedMachine.send('RETRY_NOTIFYING_REQUESTED'));
      }
    });
  });
});
