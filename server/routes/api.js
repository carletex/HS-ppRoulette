var express = require('express');
var sessionController = require('../controllers/session');
var authController = require('../controllers/auth');
var userController = require('../controllers/user');
var router = express.Router();

router.post('/session/add', authController.ensureAuthenticated, sessionController.addSession);
router.post('/session/random', authController.ensureAuthenticated, sessionController.assignRandomSession);
router.get('/session/status', authController.ensureAuthenticated, sessionController.getSessionsStatus);
router.get('/session/list', authController.ensureAuthenticated, sessionController.listSessions);
router.get('/session/stats', authController.ensureAuthenticated, sessionController.statsSessions);
router.get('/user/me', authController.ensureAuthenticated, userController.getUserData);
router.post('/user/me', authController.ensureAuthenticated, userController.setUserData);

module.exports = router;
