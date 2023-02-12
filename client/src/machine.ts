import { assign, createMachine, DoneInvokeEvent } from 'xstate';
import { destinationMachine, FetchDestinationPath } from './destination/destinationMachine';
import { CallNotificationApi, notificationMachine } from './notification/notificationMachine';
import { UploadFile, uploadMachine } from './upload/uploadMachine';

type ThisMachineContext = {} | WithErrorMsg | WithDestinationPath | (WithErrorMsg & WithDestinationPath);

type TypeState =
  | {
      value: 'fetchingPath';
      context: {};
    }
  | {
      value: 'notifying';
      context: WithErrorMsg;
    }
  | {
      value: 'uploadingFile';
      context: WithErrorMsg;
    }
  | {
      value: 'done';
      context: WithErrorMsg;
    }
  | {
      value: 'failed';
      context: { destinationPath?: string; error: string };
    };

type EventFetchingPathDone = { type: 'done.invoke.invokeFetchingPath' };
type EventFetchingPathFailed = { type: 'error.platform.invokeFetchingPath' } & EventWithErrorMsg;
type EventUploadingDone = { type: 'done.invoke.invokeUploadingFile' };
type EventUploadingFailed = { type: 'error.platform.invokeUploadingFile' } & EventWithErrorMsg;
type EventNotifyingDone = { type: 'done.invoke.invokeNotifying' };
type EventNotifyingFailed = { type: 'error.platform.invokeNotifying' } & EventWithErrorMsg;
export type EventRetryRequested = { type: 'RETRY_REQUESTED' };
export type EventCancelRequested = { type: 'CANCEL_REQUESTED' };

type Event =
  | EventFetchingPathDone
  | EventFetchingPathFailed
  | EventUploadingDone
  | EventUploadingFailed
  | EventNotifyingDone
  | EventNotifyingFailed
  | EventRetryRequested
  | EventCancelRequested;

type WithErrorMsg = { message: string };
export type WithDestinationPath = { destinationPath: string };

type EventWithErrorMsg = { data: WithErrorMsg };

const addDestinationPathToCtx = assign({
  destinationPath: (_ctx, event: DoneInvokeEvent<string>) => event.data,
});

const selectDestinationPathFromCtx = (context: WithDestinationPath, _event: DoneInvokeEvent<any>) => context.destinationPath;

export const fileUploadCoordinatorMachine = (fetchDestinationPath: FetchDestinationPath, uploadFile: UploadFile, callNotificationApi: CallNotificationApi) =>
  /** @xstate-layout N4IgpgJg5mDOIC5QFsCGBLAdgOgGZgBcBjACyygAVUCSBiCAe0zGywDcGBrF9rsAMUKlyVGgG0ADAF1EoAA4NY6AuiayQAD0QAmCQDZs+7QFYAjNvMBmPRIkBOYwBoQAT0QAOS4e2WALJYB2PTsA92NjTwBfSOc0LGwAVzkAGwZUCHJ+dGSweiYeTA5uVkK+AFUUtIzMKCycyRkkEAUlFTUmrQQbCWxtdztzYzs9fqC9ZzcEU31DW1szU3cbYb1o2IwcTAYVXBdyPOYSooLjgDlt9F3yBvUW5VVMdU67EN69Yz1dS3dtPT-x1yIaYGObzUyLZZ-aIxEBbCBwdRxR5NO5tZGgToAWgBk2xaxASLwQjINVEJFuinu7QxiF82gmHlM2GMc1Mfgkpj0dMsxnxhKSqXSmWyYAprQeT1p1l6vz0bPcvmMgQ+DIQ7iZLNsbN8HK5Pl5MMJWx2exqYqp6M0HksXi+piC9oGxm0AVV6uZrPZnO5BvW8UYzHNaMlU102l6wwCQXVI08rsBUwkXgCvhe7ncAWm5mmvmhkSAA */
  createMachine<ThisMachineContext, Event, TypeState>({
    predictableActionArguments: true,
    id: 'main',
    context: {},
    initial: 'fetchingPath',
    states: {
      fetchingPath: {
        invoke: {
          autoForward: true,
          id: 'invokeFetchingPath',
          src: destinationMachine.withConfig({
            services: {
              fetchDestinationPath,
            },
          }),
          onDone: {
            target: 'uploadingFile',
            actions: addDestinationPathToCtx,
          },
        },
      },
      uploadingFile: {
        invoke: {
          autoForward: true,
          id: 'invokeUploadingFile',
          src: uploadMachine.withConfig({
            services: {
              uploadFile,
            },
          }),
          data: selectDestinationPathFromCtx,
          onDone: 'notifying',
        },
      },
      notifying: {
        invoke: {
          autoForward: true,
          id: 'invokeNotifying',
          src: notificationMachine.withConfig({
            services: {
              callNotificationApi,
            },
          }),
          data: selectDestinationPathFromCtx,
          onDone: 'done',
        },
      },
      done: {
        type: 'final',
      },
    },
  });
