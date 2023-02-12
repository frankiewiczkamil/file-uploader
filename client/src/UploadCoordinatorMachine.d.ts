import { BaseActionObject, ResolveTypegenMeta, ServiceMap, StateMachine, StateSchema, TypegenDisabled } from 'xstate';

export type CoordinatorMachine = StateMachine<
  UploadCoordinatorMachineContext,
  StateSchema<UploadCoordinatorMachineContext>,
  UploadCoordinatorMachineEvent,
  UploadCoordinatorMachineTypeState,
  BaseActionObject,
  ServiceMap,
  ResolveTypegenMeta<TypegenDisabled, UploadCoordinatorMachineEvent, BaseActionObject, ServiceMap>
>;

export type UploadCoordinatorMachineContext = {} | WithErrorMsg | WithDestinationPath | (WithErrorMsg & WithDestinationPath);

export type UploadCoordinatorMachineTypeState =
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

export type UploadCoordinatorMachineEvent =
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
