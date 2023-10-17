import { model, Schema } from 'mongoose';
import { IService } from '../types/services';

const servicesSchema = new Schema<IService>({
  serviceName: {
    required: true,
    type: String
  },
  image: {
    type: String,
    default: null
  },
  siteUrl: {
    required: true,
    type: String
  }
});

const servicesModel = model<IService>('services', servicesSchema);

export { servicesModel };
