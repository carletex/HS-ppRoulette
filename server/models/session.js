var mongoose = require('mongoose');

var sessionSchema = new mongoose.Schema({
  hostId: Number,
  guestId: { type: Number, default: -1 },
  date: { type: Date, default: Date.now },
  description: String
}, {
  // we need to set this so empty object can be persisted
  minimize: false
});

module.exports = mongoose.model('Session', sessionSchema);
