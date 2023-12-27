import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// don't move this line down or the DB won't connect correctly
dotenv.config({ path: `./config/.env.${process.env.NODE_ENV}.local` });
import { scraperRouter } from './controllers/scraper';
import { logError, logFatal, logInfo } from '@justreadcomics/shared-node/util/logger';
import { connectToServer } from '@justreadcomics/shared-node/db/conn';

const app = express();

const port = process.env.SCRAPER_PORT || 9090;

process.on('uncaughtException', function (err) {
  logFatal(err);
  logInfo('Node NOT Exiting...');
});

app.use(cors());
app.use(express.json());

app.use('/scraper', scraperRouter);

const server = app.listen(port, async () => {
  try {
    logInfo(`Attempting to connect to db on ${process.env.NODE_ENV}`);
    await connectToServer();
  } catch (e: any) {
    logError(e);
  }
  logInfo(`Server is running on port: ${port}`);
});
server.timeout = 180000;
