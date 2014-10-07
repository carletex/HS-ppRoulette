var User = require('../models/user');


module.exports.getUserData = function(req, res) {
  User.findOne({
    'hsId': req.hsId
  }, function(err, data) {
    if(err) {
      console.log(err);
    }
    res.json(data);
  });
};

module.exports.setUserData = function(req, res) {
  User.update({'hsId': req.hsId}, {
    zulipEmail: req.body.zulipEmail
  }, function(err, numAffected, data) {
    if(err) {
      res.status(500).send(err);
    }
    res.status(200).json(data);
  });
};
