var express = require('express');
var sessionController = require('../controllers/session');
var router = express.Router();


router.post('/session', sessionController.addSession);

module.exports = router;
