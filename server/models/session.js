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

sessionSchema.statics.getOpenSessions = function(hsId, thursdaysOnly, cb) {
  var now = moment();
  var self = this;
  // First, find my current session. Then, find the open session from people
  // I'm not already involved with.
  self.model('Session').find({
    $or: [{
      hostId: hsId,
      date: {$gte: now}
    }, {
      guestId: hsId,
      date: {$gte: now}
    }]}, function(err, futureBookedSessions) {
      var alreadyBooked = [hsId]; // I don't want to book with myself
      for (var i = 0; i < futureBookedSessions.length; i++) {
        if (futureBookedSessions[0].guestId === hsId) {
          alreadyBooked.push(futureBookedSessions[0].hostId);
        } else {
          alreadyBooked.push(futureBookedSessions[0].guestId);
        }
      }

      if (thursdaysOnly) {
        self.model('Session').find({
          hostId : {$nin: alreadyBooked},
          guestId: -1,
          date: {
              $gt: moment().day(4).hour(10).minute(0).second(0),
              $lt: moment().day(4).hour(18).minute(0).second(0)
          }
        }, cb);
      } else {
        self.model('Session').find({
          hostId : {$nin: alreadyBooked},
          guestId: -1,
          date: {$gte: now}
        }, cb)
      }

    });
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

sessionSchema.statics.getStats = function(cb) {
  var self = this;
  self.model('Session').count({}, function(err, unpairedCount) {
    self.model('Session').count({guestId: {$ne: -1}}, function(err, pairedCount) {
      cb(unpairedCount, pairedCount);
    });
  });
};

module.exports = mongoose.model('Session', sessionSchema);
