var User = require('../models/user');


module.exports.getUserData = function(req, res) {
  User.findOne({
    'hsId' : req.hsId
  }, function(err, data) {
    if(err) {
      console.log(err);
    }
    return res.json(data);
  });
};
