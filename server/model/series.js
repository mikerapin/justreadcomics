const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema(
  {
    seriesName: {
      required: true,
      type: String
    },
    image: {
      required: false,
      type: String
    },
    credits: {
      required: false,
      type: Object
    },
    services: {
      required: false,
      type: Array
    },
    meta: {
      searches: {
        type: Number,
        default: 0
      },
      clickOuts: {
        type: Number,
        default: 0
      }
    },
    lastScan: {
      required: true,
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Series', seriesSchema);
