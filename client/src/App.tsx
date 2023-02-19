import './App.css';
import { createFileLoadingContainer } from './components/FileLoading';
import React from 'react';
import createFilePicker from './components/FilePicker';
import { CoordinatorMachine } from './services/UploadCoordinatorMachine';
import { createFileUploadCoordinatorMachine } from './services/machine';
import { createUploadFileEffect, ProgressListener } from './services/upload/effects/uploadFile';
import { callNotificationApi } from './services/notification/effects/callNotificationApi';
import { fetchDestinationPath } from './services/destination/effects/fetchDestinationPath';

type MachineFactory = (file: File, listener: ProgressListener) => CoordinatorMachine;
const machineFactory: MachineFactory = (file, listener) =>
  createFileUploadCoordinatorMachine(fetchDestinationPath, createUploadFileEffect(file, listener), callNotificationApi);
const FileLoadingContainer = createFileLoadingContainer(machineFactory);

const FilePicker = createFilePicker(FileLoadingContainer);

function App() {
  return (
    <div className="App">
      <FilePicker />
    </div>
  );
}

export default App;
