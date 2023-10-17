import { model, Schema } from 'mongoose';
import { IServices } from '../types/services';

const servicesSchema = new Schema<IServices>({
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

const servicesModel = model<IServices>('services', servicesSchema);

export { servicesModel };
