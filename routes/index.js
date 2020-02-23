'use strict';

const express = require('express');
const security = require('../utils/security');
const passport = require('passport');
const sanitizer = require('sanitize-html');
const router = express.Router();
const question = require('../dao/question');
const answer = require('../dao/answer');

/* GET home page. */
router.get('/', security.isAuthenticated,
    function (req, res) {
        const url = req.session.redirect_to;
        if (url != undefined) {
            delete req.session.redirect_to;
            res.redirect(url);
        } else {
            res.render('index');
        }
    });

/* GET search page */
router.get('/search', security.isAuthenticated, function (req, res, next) {
    res.render('search');
});

/* POST Perform Search */
router.post('/search', security.isAuthenticated, function (req, res, next) {

    const keywords = sanitizer(req.body.keywords);

    // :* is for partial matches like proj:* = project
    let searchBy = keywords.replaceAll(" ", ":* | ");
    searchBy += ":*";

    if (sanitizer(req.body.questionsOnly) == 'on') {
        question.search(searchBy)
            .then(answers => res.render('search-results', {answers: answers}))
            .catch(error => {

            });
    } else {
        question.fullQASearch(searchBy)
            .then(answers => res.render('search-results', {answers: answers}))
            .catch(errors => {
            });

    }
});

router.get('/login',
    passport.authenticate('azuread-openidconnect', {failureRedirect: '/'}),
    function (req, res) {
        res.redirect('/');
    }
);

/* Accept login request */
router.post('/auth/openid/return',
    passport.authenticate('azuread-openidconnect', {failureRedirect: '/'}),
    function (req, res) {
        res.redirect('/');
    }
);

/* Logout */
router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        const postLogoutRedirectUri = req.protocol + "://" + req.get('host');
        req.logOut();
        res.redirect('https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=' + postLogoutRedirectUri);
    });
});

// GET /auth/openid/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/openid/return',
    passport.authenticate('azuread-openidconnect', {failureRedirect: '/'}),
    function (req, res) {
        res.redirect('/');
    }
);
module.exports = router;
