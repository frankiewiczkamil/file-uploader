import { fileUploadCoordinatorMachine } from './machine';
import { assert, describe, it } from 'vitest';
import { interpret } from 'xstate';
import { WithDestinationPath } from './UploadCoordinatorMachine';
import { createBrokenUploadFunctionCallback, createUploadFileEffectMock } from './upload/effects/uploadFileMock';
import { createBrokenFetchDestinationPathCallback, createFetchDestinationPatchMock } from './destination/effects/fetchDestinationPathMock';
import { callNotificationApiMock, createBrokenNotifyingCallback } from './notification/effects/callNotificationApiMock';

const destinationPath = 'mocked path';
const FAILURE_ATTEMPTS = 3;

describe(
  'coordinator machine',
  () => {
    it('should go through all the states when there is no failure in sub machines', async () => {
      let uploadingCtx;
      let notifyingCtx;
      const machineDefinition = fileUploadCoordinatorMachine(
        createFetchDestinationPatchMock(destinationPath),
        createUploadFileEffectMock(),
        callNotificationApiMock
      );
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
      const machineDefinition = fileUploadCoordinatorMachine(
        createBrokenFetchDestinationPathCallback(destinationPath, FAILURE_ATTEMPTS),
        createUploadFileEffectMock(),
        callNotificationApiMock
      );
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
      const machineDefinition = fileUploadCoordinatorMachine(
        createFetchDestinationPatchMock(destinationPath),
        createBrokenUploadFunctionCallback(FAILURE_ATTEMPTS),
        callNotificationApiMock
      );
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
      const machineDefinition = fileUploadCoordinatorMachine(
        createFetchDestinationPatchMock(destinationPath),
        createUploadFileEffectMock(),
        createBrokenNotifyingCallback(FAILURE_ATTEMPTS)
      );
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
