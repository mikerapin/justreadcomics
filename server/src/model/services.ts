import { model, Schema } from 'mongoose';
import { IServicesSchema } from '../types/services';

const servicesSchema = new Schema<IServicesSchema>({
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

const servicesModel = model<IServicesSchema>('services', servicesSchema);

export { servicesModel };
