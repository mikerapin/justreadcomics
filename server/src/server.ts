import cors = require('cors');
import express = require('express');
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import { connectToServer } from './db/conn';

const app = express();

const port = process.env.PORT || 5000;

process.on('uncaughtException', function (err) {
  console.error(err);
  console.log('Node NOT Exiting...');
});

app.use(cors());
app.use(express.json());

app.listen(port, async () => {
  try {
    await connectToServer();
  } catch (e: any) {
    console.error(e);
  }
  console.log(`Server is running on port: ${port}`);
});
