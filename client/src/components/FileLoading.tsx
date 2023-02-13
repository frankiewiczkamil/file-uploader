import { useMachine } from '@xstate/react';
import { CoordinatorMachine } from '../services/UploadCoordinatorMachine';

export function createFileLoadingContainer(machine: CoordinatorMachine) {
  return function FileLoadingContainer() {
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
