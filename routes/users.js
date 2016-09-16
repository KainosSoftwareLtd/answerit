'use strict';

var sanitizer = require('sanitize-html');
var security = require('../utils/security');
var roles = require('../dao/role');
var express = require('express');
var crypto = require('crypto');

var users = require('../dao/users');

var router = express.Router();

// file left for future use
// removing it breaks a few dependencies that will be needed in the near future

module.exports = router;
