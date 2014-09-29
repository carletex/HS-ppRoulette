var express = require('express');
var config = require('../../config');
var request = require('request');
var router = express.Router();
var authController = require('../controllers/auth.js');


router.post('/hackerschool', authController.postHandler);

module.exports = router;
