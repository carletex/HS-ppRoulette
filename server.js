var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var apiRoutes = require('./server/routes/api');
var app = express();

// Database connection
mongoose.connect('mongodb://localhost/pproulette');
var db = mongoose.connection;
db.once('open', function callback () {
    console.log('Connected to database');
});

app.set('port', process.env.PORT || 8000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'client')));
app.use('/api', apiRoutes);

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
