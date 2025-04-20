import { getRoutePath } from '../../util/getRoutePath';
import type { Location, Params } from 'react-router-dom';

describe('getRoutePath', () => {
  it('should return the original pathname when there are no params', () => {
    const location: Location = {
      pathname: '/user/123',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    };
    const params: Params = {};

    const result = getRoutePath(location, params);
    expect(result).toBe('/user/123');
  });

  it('should replace param values with param names in the path', () => {
    const location: Location = {
      pathname: '/user/123',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    };
    const params: Params = {
      id: '123'
    };

    const result = getRoutePath(location, params);
    expect(result).toBe('/user/:id');
  });

  it('should handle multiple params in the path', () => {
    const location: Location = {
      pathname: '/user/123/posts/456',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    };
    const params: Params = {
      userId: '123',
      postId: '456'
    };

    const result = getRoutePath(location, params);
    expect(result).toBe('/user/:userId/posts/:postId');
  });
});
