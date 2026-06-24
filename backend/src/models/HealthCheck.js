const mongoose = require('mongoose');

const healthCheckSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true
  },
  statusCode: {
    type: Number
  },
  responseTime: {
    type: Number
  },
  isUp: {
    type: Boolean,
    required: true
  },
  checkedAt: {
    type: Date,
    default: Date.now
  }
});

// Index to optimize dashboard query retrieving the latest health check per URL
healthCheckSchema.index({ urlId: 1, checkedAt: -1 });

module.exports = mongoose.model('HealthCheck', healthCheckSchema);
