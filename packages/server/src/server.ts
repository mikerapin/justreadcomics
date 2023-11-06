import cors = require('cors');
import express = require('express');
import dotenv from 'dotenv';
// don't move this line down or the DB won't connect correctly
dotenv.config({ path: `./config/.env.${process.env.NODE_ENV}.local` });

import { connectToServer } from './db/conn';
import { seriesRouter } from './controllers/series';
import { servicesRouter } from './controllers/services';
import { scraperRouter } from './controllers/scraper';
import { authRouter } from './controllers/auth';
import { logError, logFatal, loggerMiddleware, logInfo } from './util/logger';

const app = express();

const port = process.env.PORT || 8080;

process.on('uncaughtException', function (err) {
  logFatal(err);
  logInfo('Node NOT Exiting...');
});

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
app.use('/api/series', seriesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/auth', authRouter);

// scraper services
app.use('/scraper', scraperRouter);

const server = app.listen(port, async () => {
  try {
    logInfo(`Attempting to connect to db on ${process.env.NODE_ENV}`);
    await connectToServer()
  } catch (e: any) {
    logError(e);
  }
  logInfo(`Server is running on port: ${port}`);
});
server.timeout = 120000;
