import { createMachine } from 'xstate';

export type EventDone = { type: 'done.invoke.invokeUpload' };
export type EventFailed = { type: 'error.platform.invokeUpload'; data: { message: string } };
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

export type UploadFile = (path: string) => Promise<void>;

type Ctx = string;
export const uploadMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFUAOAbA9gQwgAgDMBLdMAOiIlIGIAnMARwFc4AXAbQAYBdRUVTLCKsimAHZ8QAD0QBGACyyysgGzzOKgEwBWADQgAnnIDsATjLaAvpf1osuQiXJExeVLUxR6sWNQjjnMQA3TABrcjscfGJSCld3T29YBBcQgGNsEXEubhzJASEsiSRpRG1OYzJNFW1tU3l5AA5NeU1ZU30jBFkAZh7rWwwox1iXNw8vOF8wWg9aMgxMgkxaAFsySIcYwPHEqZTgzAyinLySguFRYtAZbsVlNQ0dTsRGpSsbEE3opzICbCcEDoYFYtAMZ34gku4kktwUSlU6i0ekMck0pmsnzEmAgcEk3xGYHyUKKsMQAFoVC8EJSBl8hltfpRSMTClcyQhtJoyCpHsjqbJGpw6QTtnFdpMfKzoddSggerJudoFZoevJjIo2px6gLOI0LCKGT9Yv9AdLSSVbq1qY0VGQ9X1HU7HYb7MbyP4xETziT2ZbECozGRTCpGsZOK1VSoeppGgKY5jLEA */
  createMachine<Ctx, Event, TypeState>({
    // context: 'initial path',
    predictableActionArguments: true,
    // there's a problem with service definition when using typegen in this machine  ¯\_(ツ)_/¯
    initial: 'inProgress',
    states: {
      inProgress: {
        invoke: {
          id: 'invokeUpload',
          src: 'uploadFile',
          onDone: 'done',
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
