var express = require('express');
var router = express.Router();

var sessionController = require('../controllers/session-controller');

/* GET home page. */
router.get('/', sessionController.list);

module.exports = router;
