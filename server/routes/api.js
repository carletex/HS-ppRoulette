var express = require('express');
var sessionController = require('../controllers/session');
var authController = require('../controllers/auth');
var userController = require('../controllers/user');
var router = express.Router();

router.post('/session', authController.ensureAuthenticated, sessionController.addSession);
router.post('/session/random', authController.ensureAuthenticated, sessionController.assignRandomSession);
router.get('/session/status', authController.ensureAuthenticated, sessionController.getSessionsStatus);
router.get('/session/list', authController.ensureAuthenticated, sessionController.listSessions);
router.get('/user/me', authController.ensureAuthenticated, userController.getUserData);

module.exports = router;
