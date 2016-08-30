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
    var username = sanitizer(req.body.username);
    var password = sanitizer(req.body.password);
    var confirmpassword = sanitizer(req.body.password2);
    var displayName = sanitizer(req.body.displayName);
    var role = sanitizer(req.body.role);


    users.add(username, displayName, password, role, function (id, error) {
        res.redirect('/');
    });

});

/* POST to update the current users password */
router.post('/update-profile', security.isAuthenticated, function (req, res, next) {
    var password = sanitizer(req.body.oldPassword);
    var newpassword = sanitizer(req.body.password);
    var confirmpassword = sanitizer(req.body.confirmPassword);

    var oldPasswordHash = crypto.createHash('sha256').update(password).digest('base64');

    if (oldPasswordHash != req.user.password) {
        res.render('user-profile', {error: "Old password incorrect"})
        return;
    }

    if (newpassword != confirmpassword) {
        res.render('user-profile', {error: "New passwords do not match"})
        return;
    }

    if (password == newpassword) {
        res.render('user-profile', {error: "New password must be different to existing password"})
        return;
    }

    if (newpassword === null || newpassword === "null" || newpassword.length < 6) {
        res.render('user-profile', {error: "New password must 6 characters"})
        return;
    }


    var passwordHash = crypto.createHash('sha256').update(newpassword).digest('base64')

    var user = req.user;

    users.update(user.id, user.displayName, passwordHash, user.role, function (done, error) {
        if (done) {
            res.redirect('/');
            return;
        } else {
            res.render('user-profile', {error: error})
            return;
        }
    });


})


module.exports = router;
