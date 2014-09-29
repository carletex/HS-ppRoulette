var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongo = require('mongoskin');
var mongoose = require('mongoose');
var config = require('./config');

var db = mongo.db('mongodb://localhost/pproulette', {native_parser:true});

var apiRoutes = require('./server/routes/api');
var app = express();

/*
 |--------------------------------------------------------------------------
 | DB schema and configuration
 |--------------------------------------------------------------------------
 */
var userSchema = new mongoose.Schema({
    displayName: String,
    hsId: String,
    email: String,
    startDate: Date,
    endDate: Date,
}, {
    minimize: false // we need to set this so empty object can be persisted
});

var User = mongoose.model('User', userSchema);
mongoose.connect(config.MONGO_URI);

app.set('port', process.env.PORT || 8000);
app.set('views', './server');
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'client')));

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }

  var token = req.headers.authorization.split(' ')[1];
  var payload = jwt.decode(token, config.TOKEN_SECRET);

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }

  req.user = payload.sub;
  next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createToken(req, user) {
  var payload = {
    iss: req.hostname,
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}

// Make our db accessible to our router
app.use(function(req,res,next) {

  req.db = db;
  next();

});

app.use('/api', apiRoutes);

/*
 |--------------------------------------------------------------------------
 |  Endpoints
 |--------------------------------------------------------------------------
 */
app.post('/auth/hackerschool', function(req, res) {
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
            User.findOne({hsId: profile.id}, function(err, existingUser) {
                // Step 3b. Create a new user account or return an existing one.
                if (existingUser) {
                    return res.send({
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
                    res.send({
                        token: createToken(req, user),
                    });
                });
            });
        });
    });
 });


app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err.message);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(app.get('port'), function() {
  console.log('Listening on port', app.get('port'));
});
