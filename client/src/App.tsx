import './App.css';
import { createFileLoadingContainer } from './components/FileLoading';
import React, { FC } from 'react';
import createFilePicker from './components/FilePicker';
import { CoordinatorMachine } from './services/UploadCoordinatorMachine';
import { fileUploadCoordinatorMachine } from './services/machine';
import { createUploadFileEffect, ProgressListener } from './services/upload/effects/uploadFile';

async function fetchDestinationPath() {
  // await new Promise((resolve) =>
  //   setTimeout(() => {
  //     console.log('fetchDestinationPath: done');
  //     resolve('');
  //   }, 5_000)
  // );
  const path = await fetch('http://localhost:3000/path').then((res) => res.json());
  console.log('fetched upload path', path);
  return path;
}

async function callNotificationApi(_path: string) {
  // await new Promise((resolve) =>
  //   setTimeout(() => {
  //     console.log('callNotificationApi: done', _path);
  //     resolve('');
  //   }, 5_000)
  // );
  await fetch('http://localhost:3000/notify', { method: 'POST' });
}

type MachineFactory = (file: File, listener: ProgressListener) => CoordinatorMachine;
const machineFactory: MachineFactory = (file, listener) =>
  fileUploadCoordinatorMachine(fetchDestinationPath, createUploadFileEffect(file, listener), callNotificationApi);
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
