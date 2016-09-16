'use strict';

var sanitizer = require('sanitize-html');
var security = require('../utils/security');
var roles = require('../dao/role');
var express = require('express');
var crypto = require('crypto');

var users = require('../dao/users');

var router = express.Router();


/* GET the profile change page */
router.get('/profile', security.isAuthenticated, function (req, res, next) {
    res.render('user-profile')
});

/* GET the add user page */
router.get('/add', security.isAuthenticatedAdmin, function (req, res, next) {
    roles.getAll(function (roles) {
        res.render('add-user', {roles: roles});
    })
});

/* POST to add a new user */
/* NO error checking is performed currently */
router.post("/add", security.isAuthenticatedAdmin, function (req, res, next) {
    var displayName = sanitizer(req.body.displayName);
    var role = sanitizer(req.body.role);
    var email = sanitizer(req.body.email);

    users.add(displayName, role, email, function (id, error) {
        res.redirect('/');
    });
});

module.exports = router;
