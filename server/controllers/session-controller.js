var Session = require('../models/session');

module.exports.create = function(req, res) {
  var session = new Session(req.body);
  session.save(function(err, result){
    res.json(result);
  });
}

module.exports.list = function(req, res) {
  Person.find({}, function(err, results){
    console.log('result', results);
    res.json(results);
  })
}