import './App.css';
import { createFileLoadingContainer } from './components/FileLoading';
import React, { FC } from 'react';
import createFilePicker from './components/FilePicker';
import { CoordinatorMachine } from './services/UploadCoordinatorMachine';
import { fileUploadCoordinatorMachine } from './services/machine';

function createUploadMockCallback(file: File) {
  return async function uploadFileMock(path: string) {
    await new Promise((resolve) =>
      setTimeout(() => {
        console.log('uploadFileMock: done', path, file);
        resolve('');
      }, 5_000)
    );
  };
}

async function fetchDestinationPath() {
  await new Promise((resolve) =>
    setTimeout(() => {
      console.log('fetchDestinationPath: done');
      resolve('');
    }, 5_000)
  );
  const path = await fetch('http://localhost:3000/path').then((res) => res.json());
  console.log('fetched upload path', path);
  return path;
}

async function callNotificationApi(path: string) {
  await new Promise((resolve) =>
    setTimeout(() => {
      console.log('callNotificationApi: done', path);
      resolve('');
    }, 5_000)
  );
  await fetch(path);
}

type MachineFactory = (file: File) => CoordinatorMachine;
const machineFactory: MachineFactory = (file) => fileUploadCoordinatorMachine(fetchDestinationPath, createUploadMockCallback(file), callNotificationApi);
const FileLoadingContainer = createFileLoadingContainer(machineFactory);

const FileComponent: FC<{ file: File }> = (props) => (
  <>
    {props.file.name}
    <FileLoadingContainer file={props.file} />
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
