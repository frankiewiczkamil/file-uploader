import express, { Express, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import cors from 'cors';
import { uploadRoute } from './upload.js';
import http from 'http';
import https from 'https';
import spdy from 'spdy'; // http2 module is not compatible with express v4
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const app: Express = express();
app.use(cors());

const port = {
  default: 18080,
  http1Ssl: 18443,
  http2Ssl: 28443,

};

const getUploadPath = (apiVersion) => {
  if (apiVersion === '1') {
    return `https://localhost:${port.http1Ssl}`;
  } else {
    return `https://localhost:${port.http2Ssl}`;
  }
}

app
  .get('/path', (req: Request, res: Response) => {
    res.send({ path: `${getUploadPath(req.params.apiVersion)}/upload/${uuid()}` });
  })
  .post('/upload/:id', uploadRoute)
  .post('/notify', (req: Request, res: Response) => {
    res.send({ message: 'roger roger' });
  });

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const certs = path.join(__dirname, '..', 'certs');

const options = {
  key: fs.readFileSync(`${certs}/key.pem`, 'utf8'),
  cert: fs.readFileSync(`${certs}/cert.pem`, 'utf8')
};
http.createServer(app).listen(port.default);
https.createServer(options, app).listen(port.http1Ssl);
spdy.createServer(options, app).listen(port.http2Ssl);
