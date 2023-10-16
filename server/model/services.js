const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Data', dataSchema);
