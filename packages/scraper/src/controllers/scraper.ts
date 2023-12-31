import express from 'express';
import {
  scrapeIndexedImageSeriesAction,
  scrapeIndexedMarvelSeriesAction,
  scrapeIndexedShonenJumpSeriesAction
} from '../scraper/indexed';
import { searchAndScrapeCorpoAction } from '../scraper/search';
import { keyChecker, verifyTokenMiddleware } from '@justreadcomics/shared-node/dist/middleware/auth';

const scraperRouter = express.Router();

/// DISABLING THESE FOR NOW, MOVING TO LAMBDA

// indexed scrape callers
scraperRouter.get('/marvel/:id', [verifyTokenMiddleware, keyChecker], scrapeIndexedMarvelSeriesAction);
scraperRouter.get('/image/:id', [verifyTokenMiddleware], scrapeIndexedImageSeriesAction);
scraperRouter.get('/shonen-jump/:id', [verifyTokenMiddleware], scrapeIndexedShonenJumpSeriesAction);
//
// // search and scrape callers
scraperRouter.get('/corpo/:id', [verifyTokenMiddleware], searchAndScrapeCorpoAction);
//
// // mass import scrapers (very primitive)
// // honestly, the following controllers should only need to be done once.
// scraperRouter.get('/mass/marvel', [verifyTokenMiddleware, keyChecker], massImportMarvelAction);
// scraperRouter.get('/mass/dc', [verifyTokenMiddleware, keyChecker], massImportDcAction);
// scraperRouter.get('/mass/image', [verifyTokenMiddleware, keyChecker], massImportImageAction);
// scraperRouter.get('/mass/shonen-jump', [verifyTokenMiddleware, keyChecker], massImportShonenJumpAction);

// DISABLING THIS BECAUSE IDW DOESN'T INDEX THEIR SHIT LIKE EVERYONE ELSE
// scraperRouter.get('/mass/idw', [verifyTokenMiddleware], massImportIdwAction);

export { scraperRouter };
