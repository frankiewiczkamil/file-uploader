import './App.css';
import { createFileLoadingContainer } from './components/FileLoading';
import React, { FC } from 'react';
import createFilePicker from './components/FilePicker';
import { CoordinatorMachine } from './UploadCoordinatorMachine';
import { fileUploadCoordinatorMachine } from './machine';

async function uploadFileMock(path: string) {
  await new Promise((resolve) =>
    setTimeout(() => {
      console.log('uploadFileMock: done', path);
      resolve('');
    }, 5_000)
  );
}

async function fetchDestinationPath() {
  await new Promise((resolve) =>
    setTimeout(() => {
      console.log('fetchDestinationPath: done');
      resolve('');
    }, 5_000)
  );
  return { path: 'mocked path' };
}

async function callNotificationApi(path: string) {
  await new Promise((resolve) =>
    setTimeout(() => {
      console.log('callNotificationApi: done', path);
      resolve('');
    }, 5_000)
  );
}

const machine: CoordinatorMachine = fileUploadCoordinatorMachine(fetchDestinationPath, uploadFileMock, callNotificationApi);
const FileLoadingContainer = createFileLoadingContainer(machine);

const FileComponent: FC<{ file: File }> = (props) => (
  <>
    {props.file.name}
    <FileLoadingContainer />
  </>
);
const FilePicker = createFilePicker(FileComponent);

function App() {
  return (
    <div className="App">
      <FilePicker />
    </div>
  );
}

export default App;
