import express from 'express';
import { keyChecker, verifyTokenMiddleware } from '../middleware/auth';
import { massImportDcAction, massImportImageAction, massImportMarvelAction } from './scraper/mass';
import { scrapeIndexedImageSeriesAction, scrapeIndexedMarvelSeriesAction } from './scraper/indexed';
import { searchAndScrapeCorpoAction } from './scraper/search';

const scraperRouter = express.Router();

// indexed scrape callers
scraperRouter.get('/marvel/:id', [verifyTokenMiddleware, keyChecker], scrapeIndexedMarvelSeriesAction);
scraperRouter.get('/image/:id', [verifyTokenMiddleware], scrapeIndexedImageSeriesAction);

// search and scrape callers
scraperRouter.get('/corpo/:id', [verifyTokenMiddleware], searchAndScrapeCorpoAction);

// mass import scrapers (very primitive)
// honestly, the following controllers should only need to be done once.
scraperRouter.get('/mass/marvel', [verifyTokenMiddleware, keyChecker], massImportMarvelAction);
scraperRouter.get('/mass/dc', [verifyTokenMiddleware, keyChecker], massImportDcAction);
scraperRouter.get('/mass/image', [verifyTokenMiddleware, keyChecker], massImportImageAction);

// DISABLING THIS BECAUSE IDW DOESN'T INDEX THEIR SHIT LIKE EVERYONE ELSE
// scraperRouter.get('/mass/idw', [verifyTokenMiddleware], massImportIdwAction);

export { scraperRouter };
