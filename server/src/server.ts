import cors = require('cors');
import express = require('express');
import dotenv from 'dotenv';
// don't move this line down or the DB won't connect correctly
dotenv.config({ path: './config.env' });

import { connectToServer } from './db/conn';
import { seriesRouter } from './controllers/series';
import { servicesRouter } from './controllers/services';

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

app.listen(port, async () => {
  try {
    await connectToServer();
  } catch (e: any) {
    console.error(e);
  }
  console.log(`Server is running on port: ${port}`);
});
