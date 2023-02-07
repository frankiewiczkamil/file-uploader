import { createMachine } from 'xstate';

export type EventDone = { type: 'done.invoke.invokeNotify' };
export type EventFailed = { type: 'error.platform.invokeNotify'; data: { message: string } };
export type EventRetryRequested = { type: 'RETRY_REQUESTED' };
type Event = EventDone | EventFailed | EventRetryRequested;

type TypeState =
  | {
      value: 'done';
      context: string;
    }
  | {
      value: 'inProgress';
      context: string;
    }
  | {
      value: 'failed';
      context: string;
    };

type Ctx = string;

export type CallNotificationApi = (path: string) => Promise<void>;
export const notificationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFUAOAbA9gQwgAgDMBLdMAOiIlIGIAnMARwFc4AXAbQAYBdRUVTLCKsimAHZ8QAD0QBGACyyysgGzzOKgEwBWADQgAnnIDsATjLaAvpf1osuQiXJExeVLUxR6sWNQjjnMQA3TABrcjscfGJSCld3T29YBBcQgGNsEXEubhzJASEsiSRpRG1OYzJNFW1tU3l5AA5NeU1ZU30jBFkAZh7rWwwox1iXNw8vOF8wWg9aMgxMgkxaAFsySIcYwPHEqZTgzAyinLySguFRYtAZbsVlNQ0dTsRGpSsbEE3opzICbCcEDoYFYtAMZ34gku4kktwUSlU6i0ekMck0pmsnzEmAgcEk3xGYHyUKKsMQAFoVC8EJSBl8hltfpRSMTClcyQhtJoyCpHsjqbJGpw6QTtnFdpMfKzoddSggerJudoFZoevJjIo2px6gLOI0LCKGT9Yv9AdLSSVbq1qY0VGQ9X1HU7HYb7MbyP4xETziT2ZbECozGRTCpGsZOK1VSoeppGgKY5jLEA */
  createMachine<Ctx, Event, TypeState>({
    predictableActionArguments: true,
    initial: 'inProgress',
    states: {
      inProgress: {
        invoke: {
          id: 'invokeNotify',
          src: 'callNotificationApi',
          onDone: {
            target: 'done',
          },
          onError: 'failed',
        },
      },
      failed: {
        on: {
          RETRY_REQUESTED: 'inProgress',
        },
      },
      done: {
        type: 'final',
      },
    },
  });
