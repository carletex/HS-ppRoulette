var Session = require('../models/session');


module.exports.addSession = function(req, res) {
  var session = new Session(req.body);
  session.hostId = req.hsId;
  session.save(function(err) {
    res.status(200).end();
  });
};


module.exports.assignRandomSession = function(req, res) {
  Session.find({}, function(err, data) {
    randomEntry = data[Math.floor(Math.random() * data.length)];
    res.json(randomEntry);
  });
};
