import { createMachine } from 'xstate';
import { CancelRequested, RetryRequested } from '../common';

export type EventDone = { type: 'done.invoke.invokeNotify' };
export type EventFailed = { type: 'error.platform.invokeNotify'; data: { message: string } };

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

type Ctx = string;

export type CallNotificationApi = (path: string) => Promise<void>;
export const notificationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgIAUAnAeykrlgGIJrCz8A3agazHa94A5agBdcAMwCeAbQAMAXUSgADtVi4xrJSAAeiACyyAnCSMA2ABwB2fdf0BmewEZZZ-QBoQkxE4sAmEn0jYKsnez8AVit7CycAXzjPNCw8QlIKGjoGRjBKGkoSZQAbdBFxakpUfh4wYTEpOUUkEFV1TXxtPQRDE3M7O0cXN09vBD8LexInMxnZKzMjJwcYiISkjBwCYnYqWnpYJgBhAEFBQ4BRABkAfQAlc4BFAFVzgGUAFXOAEUbtVo1cFpml0eqZLDYBs5XB4vD5nKZgkZ-PoIrJbNMrGsQMlNmkSOJ0LgipBGPd3rcAJp3R4vD7fX7Nf7tToGPyTNGWMxOCIoiJ+JYw0ZsgIzGa+WJcqw2VaJbEbVLbTDofCYMDEiCk87kqn3Z5vT4-BR-NQAoGgEFskgcixcnkRPlLEaIWKBRFGexRPmRPwJWX4agQODaHEKojGtqAjrAxAAWjMToQcaxIa26XwuyyB3Dpqj5tZCZtU1FtliRj80UxspTeIJRMg2eZ0YQZnhSIc82C9hmFgsCb8+icJH7wVRfiMERiln0yflqZISpVavrjJNjbzzdbFnbC3d3d7sIQRlkVom4VRPIc+jMMvWKTnLEIDcjLI3g7b9g7u8s+9GvmPkVkQC-FkCcj25adfSAA */
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
        on: {
          CANCEL_REQUESTED: 'canceled',
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
