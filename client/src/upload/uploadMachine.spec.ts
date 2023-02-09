import { EventFailed, uploadMachine } from './uploadMachine';
import { assert, describe, it } from 'vitest';
import { interpret } from 'xstate';

describe('uploadMachine', () => {
  it('should end with done state when upload callback finishes successfully', async () => {
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
  it('should end with failed state when upload callback breaks', async () => {
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
});
