var config = require('../../config');
var request = require('request');
var moment = require('moment');
var jwt = require('jwt-simple');
var User = require('../models/user');

module.exports.postHandler = function(req, res) {
  var accessTokenUrl = 'https://www.hackerschool.com/oauth/token';
  var peopleApiUrl = 'https://www.hackerschool.com/api/v1/people/me';

  var params = {
    client_id: req.body.clientId,
    redirect_uri: req.body.redirectUri,
    client_secret: config.HS_SECRET,
    code: req.body.code,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, {json: true, form: params}, function(err, response, token) {
    var accessToken = token.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
      if (!profile || profile.message === 'unauthorized') {
        console.log('Unauthorized. Did you correctly set up the ENV keys?');
        return;
      }
      User.findOne({hsId: profile.id}, function(err, existingUser) {
        if (existingUser) {
          return res.send({
            token: createToken(req, existingUser)
          });
        }

        var user = new User({
          hsId: profile.id,
          displayName: profile.first_name,
          email: profile.email,
          zulipEmail: profile.email,
          image: profile.has_photo ? profile.image : '',
          credits: 1
        });

        user.save(function(err) {
          res.send({
            token: createToken(req, user),
          });
        });
      });
    });
  });
};



module.exports.ensureAuthenticated = function(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }

  var token = req.headers.authorization.split(' ')[1];
  var payload = jwt.decode(token, config.TOKEN_SECRET);

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }

  req.hsId = payload.sub;
  next();
};

function createToken(req, user) {
  var payload = {
    iss: req.hostname,
    sub: user.hsId,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}
