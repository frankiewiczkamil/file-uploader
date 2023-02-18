import { destinationMachine, EventDone, EventFailed } from './destinationMachine';
import { assert, describe, it, vi } from 'vitest';
import { interpret } from 'xstate';

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
      const services = {
        fetchDestinationPath: async function () {
          throw new Error(expectedErrorMsg);
        },
      };
      const effectSpy = vi.spyOn(services, 'fetchDestinationPath');
      const machine = destinationMachine.withConfig({ services });
      const receivedErrorMsg = await new Promise((resolve) =>
        interpret(machine)
          .onTransition((state, event) => {
            if (state.matches('failed')) {
              resolve((event as EventFailed).data.message);
            }
          })
          .start()
      );
      assert.equal(effectSpy.mock.calls.length, 1);
      assert.equal(receivedErrorMsg, expectedErrorMsg);
    });
    it('should end with canceled state when cancel event is sent', async () => {
      const services = {
        fetchDestinationPath: function () {
          return new Promise((resolve, _reject) => {
            setImmediate(() => resolve({ path: 'path' })); // immediate is not so immediate, process.nextTick goes first
          }) as Promise<{ path: 'path' }>;
        },
      };
      const effectSpy = vi.spyOn(services, 'fetchDestinationPath');
      const machine = destinationMachine.withConfig({
        services,
      });
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
