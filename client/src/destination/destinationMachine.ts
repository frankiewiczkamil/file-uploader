import { createMachine, DoneInvokeEvent } from 'xstate';

type Services = {
  fetchDestinationPath: {
    data: { path: string };
  };
};
export type EventDone = { type: 'done.invoke.invoke'; data: { path: string } };
export type EventFailed = { type: 'error.platform.invoke'; data: { message: string } };
type DestinationResponse = { path: string };
export type FetchDestinationPath = () => Promise<DestinationResponse>;

function onDoneReturnDestinationPath(_ctx: {}, event: DoneInvokeEvent<DestinationResponse>): string {
  return event.data.path;
}

export const destinationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBE4BcCWA7Ahpg9lgAQAOeAFkQGZhoDG52UAdBhADZgDEATmAI4BXdEQjpseDIVIUA2gAYAuolAl8sDASwqQAD0QBaAIwB2AGzMAzCaPyAnNYCsAGhABPQ0bPzmADnnyJr5GAEyOAL7hrqiwmLhaMmiUNPSMWCzYpDz4UHywsFywgnR0cLAKykggahpaOvoIIQAsRsxGviYu7p7efgFBoRFRIDFxktJkSdS0DEysxCTZuWVcYDzZPBU6NZpS2lUNJibMTfJmYa4eCAYhlj525o7nQ9Hi8XuJyTNpLFQ4GJwILxaDw3Fsqjs6gdEEYmnZmPIjE8Lt1rrd7o9npFhlh8GJ4FVRhIEpMvqkmNt1LtCPVDJZLK1bA5OpdDKcLE0zJZHC0zHz+SZIq9YsSPqTpuT0vMsjk8gTVFSoaAGnYQm12SirsZev5AsEwkKRm9xgsKBLZlK2JxKbU9rS0b5LG17E5WdcvD5dQMDcMie8JmaUhbfv9ATbqftlTDQsw+SY7GYOl0tQzfMwE9zefy44a-SbPuafswIIQwOGlXpEJYOunEyzUdrPf19UNIkA */
  createMachine({
    predictableActionArguments: true,
    context: {},
    tsTypes: {} as import('./destinationMachine.typegen').Typegen0,
    schema: {
      services: {} as Services,
      events: {} as EventDone | EventFailed,
    },
    initial: 'inProgress',
    states: {
      inProgress: {
        invoke: {
          id: 'invoke',
          src: 'fetchDestinationPath',
          onDone: 'done',
          onError: 'failed',
        },
      },
      failed: {
        type: 'final',
      },
      done: {
        type: 'final',
        data: onDoneReturnDestinationPath,
      },
    },
  });
