import express from 'express';
import { scrapeIndexedShonenJumpSeriesAction } from '../actions/indexed';
import { searchAndScrapeCorpoAction, searchAndScrapeHooplaAction } from '../actions/search';
import { keyChecker, verifyTokenMiddleware } from '@justreadcomics/shared-node/dist/middleware/auth';
import {
  refreshCorpoMetadataAction,
  refreshImageMetadataAction,
  refreshMarvelMetadataAction
} from '../actions/refresh';
import { confirmIdAndFetchSeries } from '../middleware/refreshFetch';

const scraperRouter = express.Router();

// indexed scrape callers
// DEPRECATE THESE AND REWRITE USING CHEERIO IN THE REFRESH FILE
scraperRouter.get('/shonen-jump/:id', [verifyTokenMiddleware], scrapeIndexedShonenJumpSeriesAction);
//
// // search and scrape callers
scraperRouter.get('/corpo/:id', [verifyTokenMiddleware], searchAndScrapeCorpoAction);
scraperRouter.get('/hoopla/:id', [verifyTokenMiddleware], searchAndScrapeHooplaAction);

// refresh metadata
scraperRouter.get('/refresh/marvel/:id', [confirmIdAndFetchSeries], refreshMarvelMetadataAction);
scraperRouter.get('/refresh/dc/:id');
scraperRouter.get('/refresh/image/:id', [confirmIdAndFetchSeries], refreshImageMetadataAction);
scraperRouter.get('/refresh/shonen-jump/:id');
scraperRouter.get('/refresh/corpo/:id', [confirmIdAndFetchSeries], refreshCorpoMetadataAction);
scraperRouter.get('/refresh/hoopla/:id');
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
