import express, { Express, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import cors from 'cors';

const app: Express = express();
app.use(cors());

const port = 3000;

app
  .get('/path', (req: Request, res: Response) => {
    res.send({ path: `http://localhost:3000/upload/${uuid()}` });
  })
  .get('/upload/:id', (req: Request, res: Response) => {
    res.send(req.params['id']);
  });

app.listen(port, () => {
  console.log(`[server] start server http://localhost:${port}`);
});
