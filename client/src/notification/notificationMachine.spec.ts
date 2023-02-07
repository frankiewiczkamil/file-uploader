import { EventDone, EventFailed, notificationMachine } from './notificationMachine';
import { assert, describe, test } from 'vitest';
import { interpret } from 'xstate';

describe('notificationMachine', () => {
  test('should end with done state when notify callback finishes successfully', async () => {
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
  test('should end with failed state when notify callback breaks', async () => {
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
  test('should retry notify on retry event in failed state', async () => {
    let attempt = 1;
    const machine = notificationMachine.withConfig({
      services: {
        callNotificationApi: async function () {
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
    assert.equal((event as EventDone).type, 'done.invoke.invokeNotify');
  });
});
