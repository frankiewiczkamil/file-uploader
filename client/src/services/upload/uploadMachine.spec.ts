import { EventFailed, uploadMachine } from './uploadMachine';
import { assert, describe, it } from 'vitest';
import { interpret, Interpreter } from 'xstate';
import { isPending } from '../common';

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

  it('should end with canceled state when cancel event is sent', async () => {
    let finished = false;
    const machine = uploadMachine.withConfig({
      services: {
        uploadFile: async function () {
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
});
