import { isAllowedImageHost } from '../controllers/queue';

jest.mock('@justreadcomics/shared-node/dist/middleware/auth', () => ({
  verifyTokenMiddleware: jest.fn()
}));
jest.mock('@justreadcomics/shared-node/dist/model/lookup', () => ({}));
jest.mock('@justreadcomics/shared-node/dist/model/series', () => ({}));
jest.mock('@justreadcomics/shared-node/dist/s3/s3', () => ({}));
jest.mock('@justreadcomics/shared-node/dist/util/logger', () => ({ logError: jest.fn() }));
jest.mock('@justreadcomics/shared-node/dist/model/queue', () => ({}));
jest.mock('@justreadcomics/shared-node/dist/util/scraper', () => ({}));

describe('isAllowedImageHost', () => {
  it('allows S3 URLs', () => {
    expect(isAllowedImageHost('https://s3.amazonaws.com/bucket/cover.jpg')).toBe(true);
  });

  it('allows subdomain S3 URLs', () => {
    expect(isAllowedImageHost('https://my-bucket.s3.amazonaws.com/cover.jpg')).toBe(true);
  });

  it('allows justreadcomics.com URLs', () => {
    expect(isAllowedImageHost('https://www.justreadcomics.com/images/cover.jpg')).toBe(true);
  });

  it('blocks unknown hosts', () => {
    expect(isAllowedImageHost('https://evil.com/image.jpg')).toBe(false);
  });

  it('blocks a URL that only contains the allowed hostname as a path segment', () => {
    expect(isAllowedImageHost('https://evil.com/s3.amazonaws.com/image.jpg')).toBe(false);
  });

  it('throws on a malformed URL', () => {
    expect(() => isAllowedImageHost('not-a-url')).toThrow();
  });
});
