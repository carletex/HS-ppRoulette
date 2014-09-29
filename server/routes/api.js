var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res){
  var session = req.db.collection('session');

  session.find().toArray(function(err, result) {
    if (err) {
      res.status(500).end();
      return;
    }
    res.json(result);
  });

});

module.exports = router;
