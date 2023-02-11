import { destinationMachine, EventDone, EventFailed } from './destinationMachine';
import { assert, describe, it } from 'vitest';
import { interpret, Interpreter } from 'xstate';
import { isPending } from '../common';

describe(
  'destinationMachine',
  () => {
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
    it('should end with canceled state when cancel event is sent', async () => {
      let finished = false;
      const machine = destinationMachine.withConfig({
        services: {
          fetchDestinationPath: async function () {
            const result = (await new Promise((resolve) => {
              function onFinishedCallback() {
                finished = true;
                resolve({ path: 'path' });
              }

              setTimeout(onFinishedCallback, 3000);
            })) as { path: string };
            return result;
          },
        },
      });
      let interpretedMachine: Interpreter<any, any, any, any, any>;
      const task = new Promise((resolve) => {
        interpretedMachine = interpret(machine)
          .onTransition((state, _event) => {
            if (state.matches('canceled')) {
              resolve(undefined);
            }
          })
          .start();
        setImmediate(() => interpretedMachine.send('CANCEL_REQUESTED'));
      });
      assert.isTrue(await isPending(task));
      await task;
      assert.isFalse(await isPending(task));
      assert.isFalse(finished);
    });
  },
  { timeout: 10 }
);
