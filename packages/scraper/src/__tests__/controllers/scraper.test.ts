import { Request, Response } from 'express';
import { scraperRouter } from '../../controllers/scraper';
import { scrapeIndexedShonenJumpSeriesAction } from '../../actions/indexed';
import { searchAndScrapeCorpoAction, searchAndScrapeHooplaAction } from '../../actions/search';
import { verifyTokenMiddleware } from '@justreadcomics/shared-node/dist/middleware/auth';
import { confirmIdFromParamAndFetchSeries } from '@justreadcomics/shared-node/dist/middleware/refreshFetch';
import {
  refreshCorpoMetadataAction,
  refreshImageMetadataAction,
  refreshMarvelMetadataAction
} from '../../actions/refresh';

// Mock the middleware and actions
jest.mock('@justreadcomics/shared-node/dist/middleware/auth', () => ({
  verifyTokenMiddleware: jest.fn((req, res, next) => next())
}));

jest.mock('@justreadcomics/shared-node/dist/middleware/refreshFetch', () => ({
  confirmIdFromParamAndFetchSeries: jest.fn((req, res, next) => next())
}));

jest.mock('../../actions/indexed', () => ({
  scrapeIndexedShonenJumpSeriesAction: jest.fn()
}));

jest.mock('../../actions/search', () => ({
  searchAndScrapeCorpoAction: jest.fn(),
  searchAndScrapeHooplaAction: jest.fn()
}));

jest.mock('../../actions/refresh', () => ({
  refreshCorpoMetadataAction: jest.fn(),
  refreshImageMetadataAction: jest.fn(),
  refreshMarvelMetadataAction: jest.fn()
}));

describe('Scraper Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      params: { id: 'test-id' }
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  const findRoute = (path: string) => {
    return scraperRouter.stack.find((layer) => {
      const route = layer.route;
      return route?.path === path && (route as any).methods?.get;
    });
  };

  describe('Route: /shonen-jump/:id', () => {
    it('should use verifyTokenMiddleware', () => {
      const route = findRoute('/shonen-jump/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[0].handle).toBe(verifyTokenMiddleware);
    });

    it('should call scrapeIndexedShonenJumpSeriesAction', () => {
      const route = findRoute('/shonen-jump/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[1].handle).toBe(scrapeIndexedShonenJumpSeriesAction);
    });
  });

  describe('Route: /corpo/:id', () => {
    it('should use verifyTokenMiddleware', () => {
      const route = findRoute('/corpo/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[0].handle).toBe(verifyTokenMiddleware);
    });

    it('should call searchAndScrapeCorpoAction', () => {
      const route = findRoute('/corpo/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[1].handle).toBe(searchAndScrapeCorpoAction);
    });
  });

  describe('Route: /hoopla/:id', () => {
    it('should use verifyTokenMiddleware', () => {
      const route = findRoute('/hoopla/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[0].handle).toBe(verifyTokenMiddleware);
    });

    it('should call searchAndScrapeHooplaAction', () => {
      const route = findRoute('/hoopla/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[1].handle).toBe(searchAndScrapeHooplaAction);
    });
  });

  describe('Route: /refresh/marvel/:id', () => {
    it('should use correct middleware chain', () => {
      const route = findRoute('/refresh/marvel/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[0].handle).toBe(verifyTokenMiddleware);
      expect(route?.route?.stack[1].handle).toBe(confirmIdFromParamAndFetchSeries);
    });

    it('should call refreshMarvelMetadataAction', () => {
      const route = findRoute('/refresh/marvel/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[2].handle).toBe(refreshMarvelMetadataAction);
    });
  });

  describe('Route: /refresh/image/:id', () => {
    it('should use correct middleware chain', () => {
      const route = findRoute('/refresh/image/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[0].handle).toBe(verifyTokenMiddleware);
      expect(route?.route?.stack[1].handle).toBe(confirmIdFromParamAndFetchSeries);
    });

    it('should call refreshImageMetadataAction', () => {
      const route = findRoute('/refresh/image/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[2].handle).toBe(refreshImageMetadataAction);
    });
  });

  describe('Route: /refresh/corpo/:id', () => {
    it('should use correct middleware chain', () => {
      const route = findRoute('/refresh/corpo/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[0].handle).toBe(verifyTokenMiddleware);
      expect(route?.route?.stack[1].handle).toBe(confirmIdFromParamAndFetchSeries);
    });

    it('should call refreshCorpoMetadataAction', () => {
      const route = findRoute('/refresh/corpo/:id');

      expect(route).toBeDefined();
      expect(route?.route?.stack[2].handle).toBe(refreshCorpoMetadataAction);
    });
  });
});
