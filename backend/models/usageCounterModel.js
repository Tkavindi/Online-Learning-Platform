const mongoose = require('mongoose');

const usageCounterSchema = new mongoose.Schema({
  apiName: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }
});

const UsageCounter = mongoose.model('UsageCounter', usageCounterSchema);

module.exports = UsageCounter;
