import { UploadFile } from './uploadMachine';

type UploadFileEffect = {
  run: UploadFile;
  cancel: any;
};
