import { useMachine } from '@xstate/react';
import { CoordinatorMachine } from '../services/UploadCoordinatorMachine';
import { useMemo } from 'react';

export function createFileLoadingContainer(machineFactory: (file: File) => CoordinatorMachine) {
  return function FileLoadingContainer(props: { file: File }) {
    const machine = useMemo(() => machineFactory(props.file), [props.file]);
    const [current, send, service] = useMachine(machine);
    return <FileLoading state={current.value} cancel={() => send({ type: 'CANCEL_REQUESTED' })} retry={() => send('RETRY_REQUESTED')} />;
  };
}

function FileLoading({ state, cancel, retry }: any) {
  return (
    <>
      current: {state}
      <button onClick={cancel}>cancel</button>
      <button onClick={retry}>retry</button>
    </>
  );
}
