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
export type EventRetryFetchingPathRequested = { type: 'RETRY_FETCHING_PATH_REQUESTED' };
export type EventRetryUploadingRequested = { type: 'RETRY_UPLOADING_REQUESTED' };
export type EventRetryNotifyingRequested = { type: 'RETRY_NOTIFYING_REQUESTED' };

type Event =
  | EventFetchingPathDone
  | EventFetchingPathFailed
  | EventUploadingDone
  | EventUploadingFailed
  | EventNotifyingDone
  | EventNotifyingFailed
  | EventRetryRequested
  | EventRetryFetchingPathRequested
  | EventRetryUploadingRequested
  | EventRetryNotifyingRequested;

type WithErrorMsg = { message: string };
export type WithDestinationPath = { destinationPath: string };

type EventWithErrorMsg = { data: WithErrorMsg };

const addDestinationPathToCtx = assign({
  destinationPath: (_ctx, event: DoneInvokeEvent<string>) => event.data,
});

const selectDestinationPathFromCtx = (context: WithDestinationPath, _event: DoneInvokeEvent<any>) => context.destinationPath;

export const fileUploadCoordinatorMachine = (fetchDestinationPath: FetchDestinationPath, uploadFile: UploadFile, callNotificationApi: CallNotificationApi) =>
  /** @xstate-layout N4IgpgJg5mDOIC5QBE4BcCWA7Ahpg9lgAQAOeAFkQGZhoDG52UAdBhADZgDEN95AChQDaABgC6iUCXywMBLJJAAPRAE4A7MwBsAZnVaArDoAsAJhMGAHABoQAT0QBaVauYjLIraq1aAjO9VjHV8AXxDbVFhMXHlSCmpaBiZmXiSsKEE0ci4IQjBWLAA3fABrfMjovAxCOKyEvmTUxnTM8gRsYroqwlExXsVpWXlFFQRjbzcDVQNTSzMLG3snX2NNd09vPwCgsIj0bG7iMjqmxsTmjIouAFcSdnwcCAAxDE5+pBBBuWqFD9GdVQiZgGETGOYiVTmYxWWwOBDOVzrLw+fyWQLBXYgCoHWLHSindLMW73R5MF6cHJ5ArFMrMbExH61fHnZLEh4QMmvMDtIr4LryXrvKQyb6EEaIdSqHRuVSWKYQqEwpYIfzMVS+KUiHQ6NH+AxeHSY+mHJn1NIsNmk9Lk7hYfCYKh2IWfEXDP6ILQeZi+FamXxTRWLOEItweZFbNFBULhLH7Bk1PFmi7MO0OuxMHjYDCwcjOr5u0CjQHS4umdRzQOwpwuUMbFHbDGYu0QOCKY24+IEqADV0-cXw7XMSxaKGGfQGYwa6ZV+FQ4EedQicsebXBYxGuMmxNd1gcMA9oZ990q4zevSGEyBkQiAwz5yWed1iPo6N7KI4xnblmErutA+i35C0QcxfGBAxfHUf1IQWO9fFMUxa3DVEXw3d94yOTtvwtO52U5Th-wLZREBmB95XUct5mhINq1IsNNmQqNUMqDsTiwlN7QwR0mAIo8gIQcsDGYUwpWLSilWDWVHyQhtX1jNCt0whpCVyLB9w+fNeKIlVry0NUDElQxoKou9JKsJ8GMbMIgA */
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
