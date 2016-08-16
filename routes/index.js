var express = require('express');
var security = require('../utils/security');
var passport = require('passport');
var sanitizer = require('sanitize-html');

var router = express.Router();

var question = require('../dao/question');
var answer = require('../dao/answer');

/* Login page */
router.get('/login', function (req, res, next) {
    res.render('login', {layout: 'unauthenticated'});
});

/* Accept login request */
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

module.exports = router;
