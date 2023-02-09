import { EventFailed, notificationMachine } from './notificationMachine';
import { assert, describe, it } from 'vitest';
import { interpret } from 'xstate';

describe('notificationMachine', () => {
  it('should end with done state when notify callback finishes successfully', async () => {
    const machine = notificationMachine.withConfig({
      services: {
        callNotificationApi: async function () {
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
  it('should end with failed state when notify callback breaks', async () => {
    const expectedErrorMsg = 'zonk';
    const machine = notificationMachine.withConfig({
      services: {
        callNotificationApi: async function () {
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
