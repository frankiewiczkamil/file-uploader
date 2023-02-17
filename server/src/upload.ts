import multer from 'multer';
import { Request, Response } from 'express';

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'tmp');
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}-${req.params['id']}`);
  },
});

const upload = multer({ storage }).any();

export function uploadRoute(req: Request, res: Response) {
  upload(req, res, function (err) {
    res.send(err || 'ack');
  });
}
