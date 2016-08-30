/**
 * Security helper functions
 */
var Security = function () {
};


/**
 * Check if the users is authenticated
 *
 * If not the target url is stored in the session and the user is redirected to the login page
 *
 */
Security.isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;

        if (req.user.admin || req.user.rolename === 'author' ) {
            req.user.canEdit = true;
        }

        return next();
    }

    req.session.redirect_to = req.baseUrl + req.url;
    res.redirect('/login');
}


Security.canEdit = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;

        if (req.user.admin || req.user.rolename === 'author' ) {
            req.user.canEdit = true;
            return next();
        } else {
            res.redirect('/error');
        }
    }

    req.session.redirect_to = req.url;
    res.redirect('/login');
}

/**
 * Check if the users is an authenticated admin
 *
 * If not the target url is stored in the session and the user is redirected to the login page
 */
Security.isAuthenticatedAdmin = function (req, res, next) {
    if (req.isAuthenticated() && req.user.admin) {
        res.locals.user = req.user;
        req.user.canEdit = true;

        return next();
    }
    
    req.session.redirect_to = req.baseUrl + req.url;
    res.redirect('/login');
}


module.exports = Security;