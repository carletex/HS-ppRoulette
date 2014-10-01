var Session = require('../models/session');
var User = require('../models/user');


module.exports.addSession = function(req, res) {
  var session = new Session(req.body);
  session.hostId = req.hsId;
  session.save(function(err) {
    res.status(200).end();
  });
};


module.exports.assignRandomSession = function(req, res) {

  var week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  Session.find({
    'hsId' : {$ne: req.hsId},
    'guestId': -1
  }, function(err, data) {

    if (data.length) {
      randomEntry = data[Math.floor(Math.random() * data.length)];
      randomEntryObject = randomEntry.toObject();

      User.findOne({hsId: randomEntry.hostId}, function(err, data) {

        randomEntryObject.hostName = data.displayName;
        randomEntryObject.day = week[randomEntryObject.date.getDay()];
        randomEntryObject.hour = randomEntryObject.date.getHours() + ':' + randomEntryObject.date.getMinutes();

        randomEntry.update({guestId: req.hsId}, function(err, numAffected) {
          if (numAffected !== 1 || err) {
            throw 'Something went wrong' + err;
          }
          res.json(randomEntryObject);
        });

      });
    } else {
      res.json({});
    }

  });
};

module.exports.getSessionsStatus = function(req, res) {
  var now = new Date();
  var end = new Date(now.getFullYear(), now.getMonth(), now.getDay(), 18, 30);
  console.log(now, end);
  Session.find({date: {$gte: now, $lt: end}})
    .distinct('hostId')
    .count(function (err, count) {
      res.json(count);
    });
};
