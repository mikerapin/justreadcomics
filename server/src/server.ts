import cors = require('cors');
import express = require('express');
import dotenv from 'dotenv';
// don't move this line down or the DB won't connect correctly
dotenv.config({ path: `./config/.env.${process.env.NODE_ENV}` });

import { connectToServer } from './db/conn';
import { seriesRouter } from './controllers/series';
import { servicesRouter } from './controllers/services';
import { scraperRouter } from './controllers/scraper';
import { authRouter } from './controllers/auth';

const app = express();

const port = process.env.PORT || 5000;

process.on('uncaughtException', function (err) {
  console.error(err);
  console.log('Node NOT Exiting...');
});

app.use(cors());
app.use(express.json());
app.use('/api/series', seriesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/auth', authRouter);

// scraper services
app.use('/scraper', scraperRouter);

const server = app.listen(port, async () => {
  try {
    await connectToServer();
  } catch (e: any) {
    console.error(e);
  }
  console.log(`Server is running on port: ${port}`);
});
server.timeout = 120000;
