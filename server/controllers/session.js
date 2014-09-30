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
  Session.find({}).lean().exec(function(err, data) {
    randomEntry = data[Math.floor(Math.random() * data.length)];
    User.findOne({hsId: randomEntry.hostId}, function(err, data) {
      randomEntry.hostName = data.displayName;
      var week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      randomEntry.day = week[randomEntry.date.getDay()];
      randomEntry.hour = randomEntry.date.getHours() + ':' + randomEntry.date.getMinutes();
      res.json(randomEntry);
    });
  });
};
