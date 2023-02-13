import { EventFailed, notificationMachine } from './notificationMachine';
import { assert, describe, it } from 'vitest';
import { interpret, Interpreter } from 'xstate';
import { isPending } from '../common';

describe(
  'notificationMachine',
  () => {
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
    it('should end with canceled state when cancel event is sent', async () => {
      let finished = false;
      const machine = notificationMachine.withConfig({
        services: {
          callNotificationApi: async function () {
            await new Promise((resolve) => {
              function onFinishedCallback() {
                finished = true;
                resolve(null);
              }

              setTimeout(onFinishedCallback, 3000);
            });
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
