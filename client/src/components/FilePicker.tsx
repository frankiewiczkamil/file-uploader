import React, { ChangeEvent, FC, useState } from 'react';

function createFilePicker(FileComponentImpl: FC<{ file: File }>) {
  return function FilePicker() {
    const [files, setFiles] = useState<Array<File>>([]);
    const addFiles = (newFiles: FileList) => {
      const newWithoutRepetitions = [...newFiles].filter(notIn(files));
      setFiles([...files, ...newWithoutRepetitions]);
    };

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files !== null) {
        addFiles(event.target.files || []);
      }
    };

    return (
      <div>
        <input type="file" onChange={onInputChange} multiple />
        <ul>
          {files.map((file) => (
            <li key={file.name + file.lastModified}>
              <FileComponentImpl file={file} />
            </li>
          ))}
        </ul>
      </div>
    );
  };
}

const equal = (file1: File, file2: File) => file1.name === file2.name && file1.lastModified === file2.lastModified;
const notIn = (oldFiles: Array<File>) => (newFile: File) => oldFiles.findIndex((oldFile) => equal(newFile, oldFile)) === -1;
export default createFilePicker;
