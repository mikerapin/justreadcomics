import express from 'express';
import { Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';

// most of the auth business here was taken from this guide:
//   https://hackernoon.com/how-to-add-authentication-to-a-full-stack-mern-web-application

const authRouter = express.Router();

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const TOKEN = process.env.TOKEN_KEY || '';

authRouter.get('/me', (req: Request, res: Response) => {
  const token = String(req.headers.authorization)
    .replace(/^Bearer|^jwt/i, '')
    .replace(/^\s+|\s+$/gi, '');

  try {
    if (!token) {
      res.status(403).json({
        statusCode: 403,
        msg: 'A token is required for authentication'
      });
    }
    /* Verifying the token. */
    if (process.env.TOKEN_KEY) {
      verify(token, process.env.TOKEN_KEY);
      res.status(200).json({});
    }
  } catch (err) {
    res.status(401).json({
      statusCode: 401,
      msg: 'Invalid Token'
    });
  }
});

/* If the email and password are correct, then return a token. */
authRouter.post('/login', (req: Request, res: Response) => {
  /* Destructuring the email and password from the request body. */
  const { username, password } = req.body;

  if (username === EMAIL && password === PASSWORD) {
    /* Creating a token. */
    const token = sign({ username }, TOKEN, {
      expiresIn: '7d'
    });
    res.status(200).json({
      statusCode: 200,
      msg: 'Login successful',
      token
    });
    return;
  }
  res.status(401).json({
    statusCode: 401,
    msg: 'Invalid Credentials'
  });
});

export { authRouter };
