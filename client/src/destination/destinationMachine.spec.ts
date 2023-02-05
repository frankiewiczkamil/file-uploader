import { destinationMachine, EventDone, EventFailed } from './destinationMachine';
import { assert, describe, test } from 'vitest';
import { interpret } from 'xstate';

describe('destinationMachine', () => {
  test('should end with done state when service callback responds with a valid message', async () => {
    const expectedPath = 'mocked path';
    const machine = destinationMachine.withConfig({
      services: {
        fetchDestinationPath: async function () {
          return { path: expectedPath };
        },
      },
    });
    const receivedPath = await new Promise((resolve) =>
      interpret(machine)
        .onTransition((state, event) => {
          if (state.matches('done')) {
            resolve((event as EventDone).data.path);
          }
        })
        .start()
    );
    assert.equal(receivedPath, expectedPath);
  });
  test('should end with failed state when service callback breaks', async () => {
    const expectedErrorMsg = 'zonk';
    const machine = destinationMachine.withConfig({
      services: {
        fetchDestinationPath: async function () {
          throw new Error(expectedErrorMsg);
        },
      },
    });
    const receivedErrorMsg = await new Promise((resolve) =>
      interpret(machine)
        .onTransition((state, event) => {
          if (state.matches('failed')) {
            resolve((event as EventFailed).data.message);
          }
        })
        .start()
    );
    assert.equal(receivedErrorMsg, expectedErrorMsg);
  });

  test('should retry fetching path on retry event in failed state', async () => {
    const expectedPath = 'mocked path';
    let attempt = 1;
    const machine = destinationMachine.withConfig({
      services: {
        fetchDestinationPath: async function () {
          if (attempt === 1) {
            attempt++;
            throw new Error('zonk');
          } else {
            return { path: expectedPath };
          }
        },
      },
    });
    const service = interpret(machine);

    await new Promise((resolve) => {
      service
        .onTransition((state, event) => {
          if (state.matches('failed')) {
            resolve(event.type);
          }
        })
        .start();
    });
    const result = await new Promise((resolve) => {
      service.onTransition((state, event) => {
        if (state.matches('done')) {
          resolve((event as EventDone).data.path);
        }
      });
      service.send('RETRY_REQUESTED');
    });
    assert.equal(result, expectedPath);
  });
});
