import { EventFailed, uploadMachine } from './uploadMachine';
import { assert, describe, it } from 'vitest';
import { interpret, Interpreter, InterpreterStatus } from 'xstate';

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

      console.log(interpretedMachine?.initialized);
      console.log(interpretedMachine.status);
      setImmediate(() => interpretedMachine.send('UPLOADING_CANCELED'));
    });
    assert.isTrue(await isPending(task));
    // @ts-ignore
    assert.equal(interpretedMachine.status, InterpreterStatus.Running);
    await task;
    assert.isFalse(await isPending(task));
    assert.isFalse(finished);
    // @ts-ignore
    assert.equal(interpretedMachine.status, InterpreterStatus.Stopped);
  });
});

async function isPending(testedPromise: Promise<any>) {
  const definitelyDifferentThing = {};
  const winnerResult = await Promise.race([testedPromise, Promise.resolve(definitelyDifferentThing)]);
  return winnerResult === definitelyDifferentThing;
}
