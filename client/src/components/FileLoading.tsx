import { useActor, useMachine } from '@xstate/react';
import { CoordinatorMachine } from '../services/UploadCoordinatorMachine';
import { useMemo } from 'react';
import { getCurrentActorRef } from '../services/machine';

export function createFileLoadingContainer(machineFactory: (file: File) => CoordinatorMachine) {
  return function FileLoadingContainer(props: { file: File }) {
    const machine = useMemo(() => machineFactory(props.file), [props.file]);
    const [coordinatorState, _send, service] = useMachine(machine);
    const [handlerState, send] = useActor(getCurrentActorRef(coordinatorState) || service);

    return (
      <FileLoading
        state={coordinatorState.value}
        handlerState={handlerState.value}
        cancel={() => send({ type: 'CANCEL_REQUESTED' })}
        retry={() => send('RETRY_REQUESTED')}
      />
    );
  };
}

function FileLoading({ state, cancel, retry, handlerState }: any) {
  return (
    <>
      {state !== 'done' && state + ': '}
      {handlerState}
      {handlerState === 'inProgress' && <button onClick={cancel}>cancel</button>}
      &nbsp;
      {(handlerState === 'canceled' || handlerState === 'failed') && <button onClick={retry}>retry</button>}
    </>
  );
}
