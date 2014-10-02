var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');

var apiRoutes = require('./server/routes/api');
var authRoutes = require('./server/routes/auth');
var app = express();

mongoose.connect(config.MONGO_URI);

app.set('port', process.env.PORT || 8000);
app.set('views', './server');
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'client')));

// import models
var User = require('./server/models/user');


// import routes
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

// redirect non-angular URL to an angular URL
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
