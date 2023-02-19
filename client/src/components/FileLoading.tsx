import { useActor, useMachine } from '@xstate/react';
import { CoordinatorMachine, UploadCoordinatorMachineState } from '../services/UploadCoordinatorMachine';
import React, { useMemo, useState } from 'react';
import { getCurrentActorRef } from '../services/machine';
import { ProgressListener } from '../services/upload/effects/uploadFile';
import './FileLoading.css';
import { SubMachineState } from '../services/common';

export function createFileLoadingContainer(machineFactory: (file: File, listener: ProgressListener) => CoordinatorMachine) {
  return function FileLoadingContainer({ file }: { file: File }) {
    const [progress, setProgress] = useState(0);
    const machine = useMemo(() => machineFactory(file, (p = 0) => setProgress(p)), [file]);
    const [coordinatorState, _send, service] = useMachine(machine);
    const [handlerState, send] = useActor(getCurrentActorRef(coordinatorState) || service);

    return (
      <FileLoading
        state={coordinatorState.value as UploadCoordinatorMachineState}
        handlerState={handlerState.value}
        cancel={() => send({ type: 'CANCEL_REQUESTED' })}
        retry={() => send('RETRY_REQUESTED')}
        progress={progress}
        name={file.name}
      />
    );
  };
}

type Propz = {
  name: string;
  state: UploadCoordinatorMachineState;
  handlerState: SubMachineState;
  cancel: React.MouseEventHandler<HTMLButtonElement>;
  retry: React.MouseEventHandler<HTMLButtonElement>;
  progress: number;
};

function FileLoading(props: Propz) {
  return (
    <div>
      <div className={'fileRow__element'}>{props.name}</div>
      <div className={'fileRow__element'}>{props.state}</div>

      <RouteDetails {...props} />
    </div>
  );
}

function RouteDetails({ state, cancel, retry, handlerState, progress, name }: Propz) {
  if (state === 'uploadingFile') return <Uploading handlerState={handlerState} cancel={cancel} retry={retry} progress={progress} />;
  else if (state === 'notifying' || state === 'fetchingPath') return <ApiCall handlerState={handlerState} cancel={cancel} retry={retry} />;
  else if (state === 'done') return <>👌</>;
  else return <></>;
}

function ApiCall({ cancel, retry, handlerState }: Partial<Propz>) {
  return (
    <>
      <div className={'fileRow__element'}>{handlerState}</div>
      <Button handlerState={handlerState} cancel={cancel} retry={retry} />
    </>
  );
}

function Uploading({ cancel, retry, handlerState, progress }: Partial<Propz>) {
  return (
    <>
      <div className={'fileRow__element'}>{handlerState === 'inProgress' ? <meter value={progress} /> : handlerState}</div>
      <Button handlerState={handlerState} cancel={cancel} retry={retry} />
    </>
  );
}

function Button({ cancel, retry, handlerState }: Partial<Propz>) {
  return (
    <div className={'fileRow__element'}>
      {handlerState === 'inProgress' ? <button onClick={cancel}>cancel</button> : <button onClick={retry}>retry</button>}
    </div>
  );
}
