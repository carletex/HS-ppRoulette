var express = require('express');
var sessionController = require('../controllers/session');
var authController = require('../controllers/auth');
var userController = require('../controllers/user');
var router = express.Router();

router.post('/session', authController.ensureAuthenticated, sessionController.addSession);
router.get('/session/random', authController.ensureAuthenticated, sessionController.assignRandomSession);
router.get('/session/status', authController.ensureAuthenticated, sessionController.getSessionsStatus);
router.get('/user/me', authController.ensureAuthenticated, userController.getUserData);

module.exports = router;
