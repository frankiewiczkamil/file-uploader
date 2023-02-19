import multer from 'multer';
import { Request, Response } from 'express';
import * as fs from 'fs';

const FILES_DIR = 'tmp';

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
    cb(null, FILES_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}-${req.params['id']}`);
  },
});

const upload = multer({ storage }).any();

export function uploadRoute(req: Request, res: Response) {
  upload(req, res, function (err) {
    if (err) {
      res.status(500);
      res.send({ msg: err });
    } else {
      res.send({ msg: 'successfully uploaded' });
    }
  });
}
