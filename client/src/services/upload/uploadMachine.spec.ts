import { EventFailed, uploadMachine } from './uploadMachine';
import { assert, describe, it, vi } from 'vitest';
import { interpret } from 'xstate';

describe(
  'uploadMachine',
  () => {
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
      const services = {
        uploadFile: async function () {
          throw new Error(expectedErrorMsg);
        },
      };
      const effectSpy = vi.spyOn(services, 'uploadFile');
      const machine = uploadMachine.withConfig({
        services,
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
      assert.equal(effectSpy.mock.calls.length, 1);
      assert.equal(errorMsg, expectedErrorMsg);
    });

    it('should end with canceled state when cancel event is sent', async () => {
      const services = {
        uploadFile: function () {
          return new Promise((resolve, _reject) => {
            setImmediate(resolve); // immediate is not so immediate, process.nextTick goes first
          });
        },
      };
      const effectSpy = vi.spyOn(services, 'uploadFile');
      const machine = uploadMachine.withConfig({ services });
      const task = new Promise((resolve) => {
        const interpretedMachine = interpret(machine)
          .onTransition((state, _event) => {
            if (state.matches('canceled')) {
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
