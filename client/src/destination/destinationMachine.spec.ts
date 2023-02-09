import { destinationMachine, EventDone, EventFailed } from './destinationMachine';
import { assert, describe, it } from 'vitest';
import { interpret } from 'xstate';

describe('destinationMachine', () => {
  it('should end with done state when service callback responds with a valid message', async () => {
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
  it('should end with failed state when service callback breaks', async () => {
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
});
