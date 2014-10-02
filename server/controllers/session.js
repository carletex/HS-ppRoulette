var moment = require('moment');
var Session = require('../models/session');
var User = require('../models/user');


module.exports.addSession = function(req, res) {
  var day = moment();

  // create a new date according to user provided time
  var selectedTime = day.hours(req.body.hour).minutes(req.body.minute);

  // if booking for tomorrow, then date = date + 1 day
  if (req.body.day === 'tomorrow')  {
    selectedTime = selectedTime.add(1, 'day');
  }

  // don't authorize sessions on sundays, fridays, saturdays
  if (day.day() === 0 || day.day() === 5 || day.day() === 6) {
    res.status(403).end();
  }

  req.body.date = selectedTime.toISOString();
  req.body.hostId = req.hsId;

  // create the session
  var session = new Session(req.body);

  // save it
  session.save(function(err) {
    User.getUserById(req.hsId, function(err, currentUser) {
      // add credit to the correct user
      currentUser.addCredit(function(err, data) {
        res.status(200).end();
      });
    });
  });
};


module.exports.assignRandomSession = function(req, res) {
  var week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  User.getUserById(req.hsId, function(err, user) {
    if (user.credits) {
      // get all open slots
      Session.getOpenSessions(req.hsId, function(err, sessions) {

        if (sessions.length) {
          // pick one randomly
          session = sessions[Math.floor(Math.random() * sessions.length)];
          sessionJSON = session.toObject();

          User.getUserById(session.hostId, function(err, user) {

            // stuff to display on the page
            sessionJSON.hostName = user.displayName;
            sessionJSON.day = week[sessionJSON.date.getDay()];
            sessionJSON.hour = sessionJSON.date.getHours() + ':' + sessionJSON.date.getMinutes();

            // actually book the session with me, and lose one of my credits
            session.bookWith(req.hsId, function(err, numAffected) {
              if (numAffected !== 1 || err) {
                throw 'Something went wrong' + err;
              }
              User.getUserById(req.hsId, function(err, currentUser) {
                currentUser.removeCredit(function(err, data) {
                  res.json(sessionJSON);
                });
              });

            });

          });
        } else {
          res.json({});
        }

      });

    } else {
      res.json({'error': 'no credit'});
    }
  });
};

module.exports.getSessionsStatus = function(req, res) {
  var now = new Date();
  var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 30);
  Session.find({date: {$gte: now, $lt: end}, hostId: {$ne: req.hsId}, guestId: -1})
    .distinct('hostId')
    .count(function(err, count) {
      res.json(count);
    });
};
