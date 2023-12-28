import { model, models, Schema } from 'mongoose';
import { IService } from '@justreadcomics/common/dist/types/services';

const servicesSchema = new Schema<IService>({
  serviceName: {
    required: true,
    type: String,
    index: true,
    unique: true
  },
  image: {
    type: String,
    default: null
  },
  siteUrl: {
    required: true,
    type: String
  },
  searchUrl: {
    required: true,
    type: String
  },
  type: {
    required: true,
    type: String
  }
});

export const servicesModel = models.services || model<IService>('services', servicesSchema);
