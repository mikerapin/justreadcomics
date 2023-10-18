import express = require('express');
import { searchMarvel } from '../scrape/scraper';

const scraperRouter = express.Router();

scraperRouter.get('/marvel', searchMarvel);

export { scraperRouter };
