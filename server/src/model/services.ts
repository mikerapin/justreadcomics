import { model, Schema } from 'mongoose';

const dataSchema = new Schema({
  serviceName: {
    required: true,
    type: String
  },
  image: {
    required: true,
    type: String
  },
  siteUrl: {
    required: true,
    type: String
  }
});

module.exports = model('Data', dataSchema);
