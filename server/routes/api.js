var express = require('express');
var sessionController = require('../controllers/session');
var userController = require('../controllers/user');
var router = express.Router();

router.get('/user/id', userController.getId);
router.post('/session', sessionController.addSession);

module.exports = router;
