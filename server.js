#!/bin/env node
/**
 * answerIt app
 */
// Load in the environment variables
require('dotenv').config({path: 'process.env'});

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var exphbs = require('express-handlebars');

// Authentications
var users = require('./dao/users');
var passport = require('passport');
require('./utils/passport.js');

// Routes
var routes = require('./routes/index');
var users = require('./routes/users');

var AnswerIt = function () {

    // Scope
    var self = this;

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function () {
        //  Set the environment variables we need.
        self.port = process.env.PORT || 8090;
    };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating Tech Radar ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', function () {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function (element, index, array) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initialize = function () {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Setup Express
        self.app = express();
        self.app.engine('handlebars', exphbs({defaultLayout: 'main'}));
        self.app.set('view engine', 'handlebars');

        self.app.use(cookieParser());
        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded({extended: false}));

        // error handlers

        // development error handler
        // will print stacktrace
        if (self.app.get('env') === 'development') {
            console.log("In development mode");
            self.app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user
        self.app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });

        var cookie_key = process.env.COOKIE_KEY || 'aninsecurecookiekey';
        self.app.use(session({secret: cookie_key}));

        self.app.set('layoutsDir', path.join(__dirname, 'views/layouts'));
        self.app.set('views', path.join(__dirname, 'views'));
        self.app.use(express.static(path.join(__dirname, 'public')));

        // Initialize Passport and restore authentication state, if any, from the
        // session.
        self.app.use(passport.initialize());
        self.app.use(passport.session());


        // uncomment after placing your favicon in /public
        self.app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        self.app.use(logger('dev'));

        //
        // Setup the routes
        //
        self.app.use('/', routes);
        self.app.use('/users', users);

        // catch 404 and forward to error handler
        self.app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
    }

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, function () {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.port);
        });
    };

}


/**
 *  main():  Main code.
 */
var answerApp = new AnswerIt();
answerApp.initialize();
answerApp.start();