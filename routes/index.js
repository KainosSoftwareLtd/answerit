'use strict';

var express = require('express');
var security = require('../utils/security');
var passport = require('passport');
var sanitizer = require('sanitize-html');
var router = express.Router();
var question = require('../dao/question');
var answer = require('../dao/answer');

/* GET home page. */
router.get('/', security.isAuthenticated,
    function (req, res) {
        var url = req.session.redirect_to;
        if (url != undefined) {
            delete req.session.redirect_to;
            res.redirect(url);
        }
        else {
            res.render('index');
        }
    });

/* GET search page */
router.get('/search', security.isAuthenticated, function (req, res, next) {
    res.render('search');
});

/* POST Perform Search */
router.post('/search', security.isAuthenticated, function (req, res, next) {

    var keywords = sanitizer(req.body.keywords);

    var searchBy = keywords.replaceAll(" ", " | ");

    question.fullQASearch(searchBy, function (answers) {
        res.render('search-results', {answers: answers});
    });

});

/* Login page */
router.get('/login', function (req, res, next) {
    var messages = req.flash('error');
    res.render('login', {layout: 'unauthenticated', messages: messages});
});

router.post('/loginmein',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
        function (req, res) {
        res.redirect('/');
    }
);

/* Accept login request */
router.post('/auth/openid/return',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('/');
    }
);

/* Logout */
router.get('/logout', function (req, res) {
    req.session.destroy(function(err) {
        req.logOut();
        // TODO: add something like ?post_logout_redirect_uri=http://localhost:3000');
        res.redirect('https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=http://localhost:8090');
    });
});

// GET /auth/openid/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/openid/return',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('/');
    }
);
module.exports = router;
