import { EventFailed, notificationMachine } from './notificationMachine';
import { assert, describe, it, vi } from 'vitest';
import { interpret } from 'xstate';

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
      const services = {
        callNotificationApi: async function () {
          throw new Error(expectedErrorMsg);
        },
      };
      const effectSpy = vi.spyOn(services, 'callNotificationApi');

      const expectedErrorMsg = 'zonk';
      const machine = notificationMachine.withConfig({ services });
      const errorMsg = await new Promise((resolve) =>
        interpret(machine)
          .onTransition((state, event) => {
            if (state.matches('failed')) {
              resolve((event as EventFailed).data.message);
            }
          })
          .start()
      );
      assert.equal(effectSpy.mock.calls.length, 1);
      assert.equal(errorMsg, expectedErrorMsg);
    });
    it('should end with canceled state when cancel event is sent', async () => {
      const services = {
        callNotificationApi: function () {
          return new Promise((resolve, _reject) => {
            setImmediate(resolve); // immediate is not so immediate, process.nextTick goes first
          });
        },
      };

      const effectSpy = vi.spyOn(services, 'callNotificationApi');

      const machine = notificationMachine.withConfig({ services });
      const task = new Promise((resolve) => {
        const interpretedMachine = interpret(machine)
          .onTransition((state, _event) => {
            if (state.matches('canceled')) {
              console.log();
              resolve(state.value);
            }
          })
          .start();
        process.nextTick(() => {
          interpretedMachine.send('CANCEL_REQUESTED');
        });
      });
      assert.equal(effectSpy.mock.calls.length, 1);
      assert.equal(await task, 'canceled');
    });
  },
  { timeout: 10 }
);
