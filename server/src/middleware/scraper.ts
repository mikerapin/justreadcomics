import { NextFunction, Request, Response } from 'express';

export const keyChecker = (req: Request, res: Response, next: NextFunction) => {
  const key = process.env.MASS_IMPORT_KEY;
  if (req.query.key !== key) {
    res.status(400).json({ msg: 'no key, no import' });
    return;
  }
  next();
};
