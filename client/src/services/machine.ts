import { ActorRef, assign, createMachine, DoneInvokeEvent } from 'xstate';
import { destinationMachine, FetchDestinationPath } from './destination/destinationMachine';
import { CallNotificationApi, notificationMachine } from './notification/notificationMachine';
import { UploadFile, uploadMachine } from './upload/uploadMachine';
import {
  UploadCoordinatorMachineContext,
  UploadCoordinatorMachineEvent,
  UploadCoordinatorMachineTypeState,
  UploadCoordinatorState,
  WithDestinationPath,
} from './UploadCoordinatorMachine';

const addDestinationPathToCtx = assign({
  destinationPath: (_ctx, event: DoneInvokeEvent<string>) => event.data,
});

const selectDestinationPathFromCtx = (context: WithDestinationPath, _event: DoneInvokeEvent<any>) => context.destinationPath;

const invokingIdByState: Record<string, string> = {
  fetchingPath: 'invokeFetchingPath',
  uploadingFile: 'invokeUploadingFile',
  notifying: 'invokeNotifying',
};

export const getCurrentActorRef = (state: UploadCoordinatorState): ActorRef<any> => {
  const handlerMachineId = invokingIdByState[state.value as string];
  return state.children[handlerMachineId];
};
export const fileUploadCoordinatorMachine = (fetchDestinationPath: FetchDestinationPath, uploadFile: UploadFile, callNotificationApi: CallNotificationApi) =>
  /** @xstate-layout N4IgpgJg5mDOIC5QFsCGBLAdgOgGZgBcBjACyygAVUCSBiCAe0zGywDcGBrF9rsAMUKlyVGgG0ADAF1EoAA4NY6AuiayQAD0QAmCQDZs+7QFYAjNvMBmPRIkBOYwBoQAT0QAOS4e2WALJYB2PTsA92NjTwBfSOc0LGwAVzkAGwZUCHJ+dGSweiYeTA5uVkK+AFUUtIzMKCycyRkkEAUlFTUmrQQbCWxtdztzYzs9fqC9ZzcEU31DW1szU3cbYb1o2IwcTAYVXBdyPOYSooLjgDlt9F3yBvUW5VVMdU67EN69Yz1dS3dtPT-x1yIaYGObzUyLZZ-aIxEBbCBwdRxR5NO5tZGgToAWgBk2xaxASLwQjINVEJFuinu7QxiF82gmHlM2GMc1Mfgkpj0dMsxnxhKSqXSmWyYAprQeT1p1l6vz0bPcvmMgQ+DIQ7iZLNsbN8HK5Pl5MMJWx2exqYqp6M0HksXi+piC9oGxm0AVV6uZrPZnO5BvW8UYzHNaMlU102l6wwCQXVI08rsBUwkXgCvhe7ncAWm5mmvmhkSAA */
  createMachine<UploadCoordinatorMachineContext, UploadCoordinatorMachineEvent, UploadCoordinatorMachineTypeState>({
    predictableActionArguments: true,
    id: 'main',
    context: {},
    initial: 'fetchingPath',
    states: {
      fetchingPath: {
        invoke: {
          autoForward: true,
          id: invokingIdByState.fetchingPath,
          src: destinationMachine.withConfig({
            services: {
              fetchDestinationPath,
            },
          }),
          onDone: {
            target: 'uploadingFile',
            actions: [addDestinationPathToCtx],
          },
        },
      },
      uploadingFile: {
        invoke: {
          autoForward: true,
          id: invokingIdByState.uploadingFile,
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
          id: invokingIdByState.notifying,
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
