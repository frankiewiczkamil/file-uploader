import { createMachine } from 'xstate';
import { CancelRequested, RetryRequested } from '../common';

export type EventDone = { type: 'done.invoke.invokeUpload' };
export type EventFailed = { type: 'error.platform.invokeUpload'; data: { message: string } };

type Event = EventDone | EventFailed | RetryRequested | CancelRequested;

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
    }
  | {
      value: 'canceled';
      context: string;
    };

export type UploadFile = (path: string) => Promise<void>;

type Ctx = string;
export const uploadMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgIAUAnAeykrlgGIJrCz8A3agazHa94BVAA4AbauggBtAAwBdRKGHVYuAC65WikAA9EAZgBsADhIBGfQCZjMgKwB2S2cP2AnABZDAGhABPRGbGliS2MmH6ZraWoWb2+gC+8T5oWHiEpBQ0dAyMYJQ0lCRi6GoAZtSUqPw8YCLikrIKSCDKqhpazXoIRqYW1naOzm6ePv4I1vrmhtP2UWaurjLu7raJyRg4BMTsVLT0sEwAwgCCAHKHAKIAMgD6AEoXAIqCFwDKACoXACKN2q3qmnw2i6PXMVhsDicLg83j8ASsJDCYUsCxcZhkbjWIBSm3SJFK6FwokgjAe7zuAE17k8Xh9vr9mv92kDOgZjGYSE4ZK5bPp9MsFhFRohLAjpjMjIZ5jy7FicWltph0PhMGBiRBSRdyVSHs83p8fvI-ioAR1QCD2Zz0Ty+QLXEK4QhLaFkcZ3Nz5sZVlj8NQIHBtPKtkRjW1AcDEABaWFjSO2EgLRNJ5MJJLYjYKjL4XbZA6h00s82IdyWYVOwxTFwyQKudnueyGOUZ4P4wnq-PMiMIWyLczuN1GewY1yGWxmMuWdwc6JIxy2dyuNw8pupFtKlVqyAd8Os7u9sz99yD4ej8eO3syYx8wyWZGBfkr3HbFiEbdm3SIHsyPsDqtuU9loE34znYVg9j2niJIkQA */
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
        on: {
          CANCEL_REQUESTED: {
            target: 'canceled',
            actions: 'cancel',
          },
        },
      },
      failed: {
        on: {
          RETRY_REQUESTED: 'inProgress',
        },
      },
      canceled: {
        on: {
          RETRY_REQUESTED: 'inProgress',
        },
      },
      done: {
        type: 'final',
      },
    },
  });
