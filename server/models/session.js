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

  this.model('Session').find({
    hostId : {$ne: hsId},
    guestId: -1,
    date: {$gte: now}
  }, cb);
};

sessionSchema.methods.bookWith = function(guestId, cb) {
  this.model('Session').update({_id: this._id}, {guestId: guestId}, cb);
};

sessionSchema.methods.isConflicting = function(hsId, cb) {
  var start = moment(this.date).subtract(45, 'minutes');
  var end = moment(this.date).add(45, 'minutes');
  this.model('Session').find({
    $or: [{
      hostId: hsId,
      date: {$gte: start, $lte: end}
    }, {
      guestId: hsId,
      date: {$gte: start, $lte: end}
    }]
  }, cb);
};

sessionSchema.statics.getBookedSessions = function(hsId, cb) {
  var now = moment(this.date);

  this.model('Session').find({
    $or: [{
      hostId: hsId,
      guestId: {$ne: -1},
      date: {$gte: now}
    }, {
      guestId: hsId,
      date: {$gte: now}
    }]
  }, cb);
};

module.exports = mongoose.model('Session', sessionSchema);
