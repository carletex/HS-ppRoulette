var config = require('../../config');
var Session = require('../models/session');


module.exports.addSession = function(req, res) {
  var session = new Session(req.body);
  session.save(function(err) {
    res.status(200).end();
  });
};
