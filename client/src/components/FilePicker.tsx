import React, { ChangeEvent, FC, useState } from 'react';

function createFilePicker(FileComponentImpl: FC<{ file: File }>) {
  return function FilePicker() {
    const [files, setFiles] = useState<Array<File>>([]);
    const addFiles = (newFiles: FileList) => setFiles([...newFiles, ...files]);

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files !== null) {
        console.log('add ', event.target.files);
        addFiles(event.target.files || []);
      }
    };

    return (
      <>
        <input type="file" onChange={onInputChange} multiple />
        <ul>
          {files.map((file) => (
            <li key={file.name + file.lastModified}>
              <FileComponentImpl file={file} />
            </li>
          ))}
        </ul>
      </>
    );
  };
}

export default createFilePicker;
