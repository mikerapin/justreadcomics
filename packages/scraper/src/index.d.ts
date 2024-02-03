import 'express';
import { Document, Types } from 'mongoose';
import { ISeries } from '@justreadcomics/common/dist/types/series';

declare global {
  namespace Express {
    interface Locals {
      series: Document<unknown, object, ISeries> & ISeries & Required<{ _id: Types.ObjectId }>;
    }
  }
}
