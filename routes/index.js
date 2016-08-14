var express = require('express');
var security = require('../utils/security');
var passport = require('passport');

var router = express.Router();

/* Login page */
router.get('/login', function(req, res, next) {
  res.render('login', {layout: 'unauthenticated' });
});

/* Accept login request*/
router.post('/loginmein',  passport.authenticate('local', {
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
router.get('/', security.isAuthenticatedAdmin , function(req, res, next) {
  res.render('index');
});

/* Search */
router.get('/search', security.isAuthenticatedAdmin , function(req, res, next) {
  res.render('search');
});

/* Add a question */
router.get('/question/add', security.isAuthenticatedAdmin , function(req, res, next) {
  res.render('add-question');
});

module.exports = router;
