var User = require('../models/user');

module.exports.getOrCreate = function(err, response, profile) {
  User.findOne({hsId: profile.id}, function(err, existingUser) {
    if (existingUser) {
      return response.send({
        token: createToken(req, existingUser)
      });
    }
    var user = new User();
    user.hsId = profile.id;
    user.email = profile.email;
    user.displayName = profile.first_name + ' ' + profile.last_name;
    user.startDate = profile.batch.start_date;
    user.endDate = profile.batch.end_date;

    user.save(function(err) {
      response.send({
        token: createToken(req, user),
      });
    });
  });
};
