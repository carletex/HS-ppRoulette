var express = require('express');
var sessionController = require('../controllers/session');
var authController = require('../controllers/auth');
var router = express.Router();

router.post('/session', authController.ensureAuthenticated, sessionController.addSession);

module.exports = router;
