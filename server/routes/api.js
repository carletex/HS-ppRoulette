var express = require('express');
var sessionController = require('../controllers/session');
var authController = require('../controllers/auth');
var router = express.Router();

router.post('/session', authController.ensureAuthenticated, sessionController.addSession);
router.get('/session/random', authController.ensureAuthenticated, sessionController.assignRandomSession);

module.exports = router;
