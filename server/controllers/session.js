var config = require('../../config');
var moment = require('moment');
var Session = require('../models/session');
var User = require('../models/user');
var zulip = require('zulip');


module.exports.addSession = function(req, res) {
  var day = moment();

  // create a new date according to user provided time
  var selectedTime = day.hours(req.body.hour).minutes(req.body.minute);

  console.log(day.day(), req.body.day);
  req.body.day = parseInt(req.body.day, 10);

  if (req.body.day < day.day())  {
    selectedTime = selectedTime.day(7 + req.body.day);
  } else {
    selectedTime = selectedTime.add(day.day()-req.body.day, 'days');
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
            zulipNotifyStream(session.description);
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
            minutes = sessionJSON.date.getMinutes() < 10 ? '0' + sessionJSON.date.getMinutes() : sessionJSON.date.getMinutes();
            sessionJSON.hour = sessionJSON.date.getHours() + ':' + minutes;

            // actually book the session with me, and lose one of my credits
            session.bookWith(req.hsId, function(err, numAffected) {
              if (numAffected !== 1 || err) {
                console.log('Something went wrong' + err);
              }
              User.getUserById(req.hsId, function(err, currentUser) {
                currentUser.removeCredit(function(err, data) {
                  zulipNotifyPairs(sessionJSON, currentUser, function (error, response) {
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
      $gte: now
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
      $gte: now
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

module.exports.statsSessions = function(req, res) {
  Session.getStats(function(unpairedCount, pairedCount) {
    res.json({
      'unpairedCount': unpairedCount,
      'pairedCount': pairedCount
    });
  });
};


function zulipNotifyPairs(sessionJSON, currentUser, cb) {
  var client = new zulip.Client({
    email: "pair-programming-roulette-bot@students.hackerschool.com",
    api_key: config.ZULIP_SECRET,
    verbose: false
  });

  client.sendMessage({
    type: "stream",
    content: "Splendid! " + sessionJSON.hostName + " and " + currentUser.displayName + " have been paired!",
    to: ['pairing'],
    subject: "roulette (roulette.herokuapp.com)"
  });

  client.sendMessage({
    type: "private",
    content: "Hey you two, you've been paired. Meet at " + sessionJSON.hostName + "'s desk at " + sessionJSON.hour + " on " + sessionJSON.day + ".",
    to: [sessionJSON.zulipEmail || sessionJSON.hostEmail, currentUser.zulipEmail || currentUser.email]
  }, cb);
}


function zulipNotifyStream(description) {
  var client = new zulip.Client({
    email: "pair-programming-roulette-bot@students.hackerschool.com",
    api_key: config.ZULIP_SECRET,
    verbose: false
  });

  var contents = [
    'Awesome, somebody just opened a slot! Come play with us!',
    'A new session is up on the roulette. Wanna pair?',
    'Have you paired for this week yet? If not, there are an open slots in the roulette app!',
    'Someone opened up a pairing session for "' + description + '". Try to get it!'
  ];
  var content = contents[Math.floor(Math.random() * contents.length)];
  client.sendMessage({
    type: "stream",
    content: content,
    to: ['pairing'],
    subject: "roulette (roulette.herokuapp.com)"
  });
}
