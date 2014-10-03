var config = require('../../config');
var moment = require('moment');
var Session = require('../models/session');
var User = require('../models/user');
var zulip = require('zulip');


module.exports.addSession = function(req, res) {
  var day = moment();

  // create a new date according to user provided time
  var selectedTime = day.hours(req.body.hour).minutes(req.body.minute);

  if (req.body.day === 'tomorrow')  {
    selectedTime = selectedTime.add(1, 'day');
  } else if (req.body.day === 'monday') {
    selectedTime = selectedTime.day(8); // see momentjs doc
  }

  req.body.date = selectedTime.toISOString();
  req.body.hostId = req.hsId;

  // create the session
  var session = new Session(req.body);

  session.isConflicting(req.hsId, function(err, conflicts) {
    if(conflicts.length === 0) {
      // save it
      session.save(function(err) {
        User.getUserById(req.hsId, function(err, currentUser) {
          // add credit to the correct user
          currentUser.addCredit(function(err, data) {
            res.json({'error': null});
          });
        });
      });
    } else {
      res.json({
        'error': 'conflict',
        'data': conflicts[0]
      });
    }
  });
};


module.exports.assignRandomSession = function(req, res) {
  var week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  User.getUserById(req.hsId, function(err, user) {
    if (user.credits) {
      // get all open slots
      Session.getOpenSessions(req.hsId, function(err, sessions) {
        // filter out sessions with people I already got a session with

        if (sessions.length) {
          // pick one randomly
          session = sessions[Math.floor(Math.random() * sessions.length)];
          sessionJSON = session.toObject();

          User.getUserById(session.hostId, function(err, user) {

            // stuff to display on the page
            sessionJSON.hostName = user.displayName;
            sessionJSON.hostEmail = user.email;
            sessionJSON.image = user.image;
            sessionJSON.day = week[sessionJSON.date.getDay()];
            sessionJSON.hour = sessionJSON.date.getHours() + ':' + sessionJSON.date.getMinutes();

            // actually book the session with me, and lose one of my credits
            session.bookWith(req.hsId, function(err, numAffected) {
              if (numAffected !== 1 || err) {
                throw 'Something went wrong' + err;
              }
              User.getUserById(req.hsId, function(err, currentUser) {
                currentUser.removeCredit(function(err, data) {
                  var client = new zulip.Client({
                    email: "pair-programming-roulette-bot@students.hackerschool.com",
                    api_key: config.ZULIP_SECRET,
                    verbose: false
                  });
                  client.sendMessage({
                    type: "private",
                    content: "Hey you two, you've been paired. Meet at " + sessionJSON.hostName + "'s desk at " + sessionJSON.hour + " on " + sessionJSON.day + ".",
                    to: [sessionJSON.hostEmail, currentUser.email]
                  }, function (error, response) {
                    if (error) {
                      console.log("Zulip error: ", error);
                    } else {
                      res.json(sessionJSON);
                    }
                  });
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
  var now = moment();
  Session.find({
    date: {
      $gte: now.toISOString()
    },
    hostId: {
      $ne: req.hsId
    },
    guestId: -1
  })
    .distinct('hostId')
    .count(function(err, count) {
      res.json(count);
    });
};


module.exports.listSessions = function(req, res) {
  var now = moment();
  Session.find({
    date: {
      $gte: now.toISOString()
    },
    $or: [{
      hostId: {
        $ne: req.hsId
      },
      guestId: req.hsId
    },{
      hostId: req.hsId,
      guestId: {
        $ne: req.hsId
      }
    }]
  }).exec(function(err, sessions) {
      uids = [];
      var session;
      for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].hostId !== req.hsId) {
          uids.push(sessions[i].hostId);
        } else {
          uids.push(sessions[i].guestId);
        }
      }
      User.find({hsId: {$in: uids} }, function(err, users) {
        var usersArray = [];
        for (i = 0; i < users.length; i++) {
          usersArray[users[i].hsId] = users[i];
        }
        var allSessions = [];
        for (i = 0; i < sessions.length; i++) {
          var session = sessions[i].toObject();
          if (session.hostId !== req.hsId) {
            session.displayName = usersArray[session.hostId].displayName;
          } else {
            if (session.guestId !== -1) {
              session.displayName = usersArray[session.guestId].displayName;
            }
          }
          allSessions.push(session);
        }
        res.json(allSessions);
      });
    });
};
