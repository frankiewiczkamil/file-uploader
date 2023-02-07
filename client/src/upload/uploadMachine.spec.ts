import { EventDone, EventFailed, uploadMachine } from './uploadMachine';
import { assert, describe, test } from 'vitest';
import { interpret } from 'xstate';

describe('uploadMachine', () => {
  test('should end with done state when upload callback finishes successfully', async () => {
    const machine = uploadMachine.withConfig({
      services: {
        uploadFile: async function () {
          await Promise.resolve();
        },
      },
    });

    const state = await new Promise((resolve) =>
      interpret(machine)
        .onTransition((state, _event) => {
          if (state.matches('done')) {
            resolve(state.value);
          }
        })
        .start()
    );
    assert.equal(state, 'done');
  });
  test('should end with failed state when upload callback breaks', async () => {
    const expectedErrorMsg = 'zonk';
    const machine = uploadMachine.withConfig({
      services: {
        uploadFile: async function () {
          throw new Error(expectedErrorMsg);
        },
      },
    });
    const errorMsg = await new Promise((resolve) =>
      interpret(machine)
        .onTransition((state, event) => {
          if (state.matches('failed')) {
            resolve((event as EventFailed).data.message);
          }
        })
        .start()
    );
    assert.equal(errorMsg, expectedErrorMsg);
  });
  test('should retry upload on retry event in failed state', async () => {
    let attempt = 1;
    const machine = uploadMachine.withConfig({
      services: {
        uploadFile: async function () {
          if (attempt === 1) {
            attempt++;
            throw new Error('zonk');
          }
        },
      },
    });
    const service = interpret(machine);

    await new Promise((resolve) => {
      service
        .onTransition((state, event) => {
          if (state.matches('failed')) {
            resolve(event);
          }
        })
        .start();
    });
    const event = await new Promise((resolve) => {
      service.onTransition((state, event) => {
        if (state.matches('done')) {
          resolve(event);
        }
      });
      service.send('RETRY_REQUESTED');
    });
    assert.equal((event as EventDone).type, 'done.invoke.invokeUpload');
  });
});
