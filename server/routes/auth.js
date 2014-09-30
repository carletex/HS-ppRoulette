var express = require('express');
var authController = require('../controllers/auth');
var router = express.Router();


router.post('/hackerschool', authController.postHandler);

module.exports = router;
