var moment = require('moment');
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
  var now = moment();
  var end = moment().hours(18).minutes(30);

  this.model('Session').find({
    hostId : {$ne: hsId},
    guestId: -1,
    date: {$gte: now, $lt: end}
  }, cb);
};

sessionSchema.methods.bookWith = function(guestId, cb) {
  this.model('Session').update({_id: this._id}, {guestId: guestId}, cb);
};

sessionSchema.methods.isConflicting = function(cb) {
  var now = moment(this.date);
  var end = moment(this.date).add(45, 'minutes');

  this.model('Session').find({
    date: {$gte: now, $lt: end}
  }, cb);
};

module.exports = mongoose.model('Session', sessionSchema);
