#!/bin/env node

'use strict';

/**
 * answerIt app
 */

// Setup the console logging format
require('console-stamp')(console, '[ddd mmm dd HH:MM:ss]]');

// Load in the environment variables
require('dotenv').config({path: 'process.env'});

// Setup the console logging format
const logger = require('./winstonLogger')(module);

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');

const bodyParser = require('body-parser');
const session = require('express-session');
const exphbs = require('express-handlebars');
const hdf = require('handlebars-dateformat');
const flash = require('connect-flash');
const helmet = require('helmet');
const express_enforces_ssl = require('express-enforces-ssl');

// This is used for building the search terms
String.prototype.replaceAll = function(search, replacement) {
    const target = this;
    return target.split(search).join(replacement);
};

// Authentications
const passport = require('passport');
require('./utils/passport.js');

// DAO
const usersDao = require('./dao/users');

// Routes
const routes = require('./routes/index');
const users = require('./routes/users');
const question = require('./routes/question');
const answer = require('./routes/answer');

const AnswerIt = function () {
    const self = this;

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
            logger.info('%s: Received %s - terminating AnswerIt ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        logger.info('%s: Node server stopped.', Date(Date.now()));
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
        self.app.engine('handlebars',
            exphbs({
                helpers: {
                    dateFormat: hdf,
                    /**
                     * Allows to add new sections to the layout 
                     * e.g. {{{_sections.footer}}} allows to put custom <scripts> into chosen views
                     */
                    section: function(name, options){
                        if(!this._sections) this._sections = {};
                        this._sections[name] = options.fn(this);
                        return null;
                    }
                },
                defaultLayout: 'main'
            }));

        self.app.set('view engine', 'handlebars');

        /*
         * Uses 7 out of 10 helmet middleware functions,
         * leaving out contentSecurityPolicy, hpkp, and noCache
         */
        self.app.use(helmet());
        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded({extended: false}));
        self.app.use(flash());

        // Setup the Google Analytics ID if defined
        self.app.locals.google_id = process.env.GOOGLE_ID || undefined;

        const cookie_key = process.env.COOKIE_KEY || 'aninsecurecookiekey';
        const sess = {
            secret: cookie_key,
            cookie: {}
        };

        if (self.app.get('env')  === 'production') {
            self.app.enable('trust proxy', 1); // trusts first proxy - Heroku load balancer
            logger.info("In production mode");
            self.app.use(express_enforces_ssl());
            sess.cookie.secure = true;
        }

        self.app.use(session(sess));

        logger.info("GA ID:" + self.app.locals.google_id);
        logger.info("Cookie key:" + cookie_key);

        // development error handler
        // will print stacktrace
        if (self.app.get('env') === 'development') {
            logger.info("In development mode");
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



        self.app.set('layoutsDir', path.join(__dirname, 'views/layouts'));
        self.app.set('views', path.join(__dirname, 'views'));
        self.app.use(express.static(path.join(__dirname, 'public')));

        // Initialize Passport and restore authentication state, if any, from the
        // session.
        self.app.use(passport.initialize());
        self.app.use(passport.session());


        // uncomment after placing your favicon in /public
        self.app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

        //
        // Setup the routes
        //
        self.app.use('/', routes);
        self.app.use('/users', users);
        self.app.use('/question' , question);
        self.app.use('/answer' , answer);

        // catch 404 and forward to error handler
        self.app.use(function (req, res, next) {
            const err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, function () {
            logger.info('AnswerIt server started on %s:%d',
                Date(Date.now()), self.port);
        });
    };
};

/**
 *  main():  Main code.
 */
const answerApp = new AnswerIt();
answerApp.initialize();
answerApp.start();
