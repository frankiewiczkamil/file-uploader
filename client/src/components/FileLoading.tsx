import { useActor, useMachine } from '@xstate/react';
import { CoordinatorMachine } from '../services/UploadCoordinatorMachine';
import { useMemo, useState } from 'react';
import { getCurrentActorRef } from '../services/machine';
import { ProgressListener } from '../services/upload/effects/uploadFile';

export function createFileLoadingContainer(machineFactory: (file: File, listener: ProgressListener) => CoordinatorMachine) {
  return function FileLoadingContainer(props: { file: File }) {
    const [progress, setProgress] = useState(0);
    const machine = useMemo(() => machineFactory(props.file, (p = 0) => setProgress(p)), [props.file]);
    const [coordinatorState, _send, service] = useMachine(machine);
    const [handlerState, send] = useActor(getCurrentActorRef(coordinatorState) || service);

    return (
      <FileLoading
        state={coordinatorState.value}
        handlerState={handlerState.value}
        cancel={() => send({ type: 'CANCEL_REQUESTED' })}
        retry={() => send('RETRY_REQUESTED')}
        progress={progress}
      />
    );
  };
}

function FileLoading({ state, cancel, retry, handlerState, progress }: any) {
  return (
    <>
      {state !== 'done' && state + ': '}
      {handlerState}
      {handlerState === 'inProgress' && state === 'uploadingFile' && <meter value={progress} />}
      {handlerState === 'inProgress' && <button onClick={cancel}>cancel</button>}
      &nbsp;
      {(handlerState === 'canceled' || handlerState === 'failed') && <button onClick={retry}>retry</button>}
    </>
  );
}
