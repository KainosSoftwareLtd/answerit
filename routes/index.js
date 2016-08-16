var express = require('express');
var security = require('../utils/security');
var passport = require('passport');
var sanitizer = require('sanitize-html');

var router = express.Router();

var question = require('../dao/question');
var answer = require('../dao/answer');
var qalink = require('../dao/question_answer_link');

/* Login page */
router.get('/login', function (req, res, next) {
    res.render('login', {layout: 'unauthenticated'});
});

/* Accept login request*/
router.post('/loginmein', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    // failureFlash: true
}));


/* Logout */
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

/* GET home page. */
router.get('/', security.isAuthenticated, function (req, res, next) {
    res.render('index');
});

/* Search */
router.get('/search', security.isAuthenticated, function (req, res, next) {
    res.render('search');
});


module.exports = router;
