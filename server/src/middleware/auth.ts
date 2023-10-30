import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export const keyChecker = (req: Request, res: Response, next: NextFunction) => {
  const key = process.env.MASS_IMPORT_KEY;
  if (req.query.key !== key) {
    res.status(400).json({ msg: 'no key, no import' });
    return;
  }
  next();
};

export const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = String(req.headers.authorization)
    .replace(/^bearer|^jwt/i, '')
    .replace(/^\s+|\s+$/gi, '');

  try {
    if (!token) {
      return res.status(403).json({
        statusCode: 403,
        msg: 'A token is required for authentication'
      });
    }
    /* Verifying the token. */
    if (process.env.TOKEN_KEY) {
      verify(token, process.env.TOKEN_KEY);
    } else {
      throw new Error('no token provided');
    }
  } catch (err) {
    return res.status(401).json({
      statusCode: 401,
      msg: 'Invalid Token'
    });
  }
  return next();
};
