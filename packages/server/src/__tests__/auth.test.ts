import express from 'express';
import request from 'supertest';
import type { Router } from 'express';

const mockCompare = jest.fn();

jest.mock('bcrypt', () => ({
  compare: (...args: unknown[]) => mockCompare(...args)
}));

describe('POST /auth/login', () => {
  let app: express.Application;

  beforeAll(() => {
    process.env.EMAIL = 'admin@example.com';
    process.env.PASSWORD_HASH = '$2b$12$fakehash';
    process.env.TOKEN_KEY = 'test-secret-key-for-jwt-signing';

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { authRouter } = require('../controllers/auth') as { authRouter: Router };
      app = express();
      app.use(express.json());
      app.use('/auth', authRouter);
    });
  });

  afterAll(() => {
    delete process.env.EMAIL;
    delete process.env.PASSWORD_HASH;
    delete process.env.TOKEN_KEY;
  });

  beforeEach(() => {
    mockCompare.mockReset();
  });

  it('returns 200 with token on valid credentials', async () => {
    mockCompare.mockResolvedValue(true);

    const res = await request(app).post('/auth/login').send({
      username: 'admin@example.com',
      password: 'correct-password'
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.msg).toBe('Login successful');
  });

  it('returns 401 on wrong password', async () => {
    mockCompare.mockResolvedValue(false);

    const res = await request(app).post('/auth/login').send({
      username: 'admin@example.com',
      password: 'wrong-password'
    });

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe('Invalid Credentials');
  });

  it('returns 401 on wrong username', async () => {
    mockCompare.mockResolvedValue(true);

    const res = await request(app).post('/auth/login').send({
      username: 'other@example.com',
      password: 'correct-password'
    });

    expect(res.status).toBe(401);
  });

  it('returns 401 when credentials are missing', async () => {
    mockCompare.mockResolvedValue(false);

    const res = await request(app).post('/auth/login').send({});

    expect(res.status).toBe(401);
  });
});
