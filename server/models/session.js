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

sessionSchema.statics.getOpenSessions = function(hsId, cb) {
  var now = new Date();
  var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 30);

  this.model('Session').find({
    hostId : {$ne: hsId},
    guestId: -1,
    date: {$gte: now, $lt: end}
  }, cb);
};

sessionSchema.methods.bookWith = function(guestId, cb) {
  this.model('Session').update({guestId: guestId}, cb);
};

module.exports = mongoose.model('Session', sessionSchema);
