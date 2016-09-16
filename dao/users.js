'use strict';

var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var Users = function () {
};

/**
 * Get all users
 * @param done Function to call with the results
 */
Users.getAll = function (done) {
    var sql = "SELECT users.*,roles.admin as admin ,roles.name as rolename" +
        " FROM users " +
        " INNER JOIN roles on users.role=roles.id";

    dbhelper.query(sql, [],
        function (results) {
            done(results);
        },
        function (error) {
            console.log(error);
            return done(null);
        });
};

/**
 * Get a user by ID
 * @param id ID of the user to get
 * @param done Function to call with the result
 */
Users.findById = function (id, done) {
    var sql = "SELECT users.*,roles.admin as admin,roles.name as rolename" +
        " FROM users " +
        " INNER JOIN roles on users.role=roles.id" +
        " WHERE users.id=$1 ";

    dbhelper.query(sql, [id],
        function (results) {
            done(null, results[0]);
        },
        function (error) {
            console.log(error);
            return done(error, null);
        });
};

/**
 * Get a user by email
 * @param email Email of the user to search for
 * @param done Function to call with the result
 */
Users.findByEmail = function (email, done) {
    var sql = "SELECT users.*,roles.admin as admin,roles.name as rolename" +
        " FROM users " +
        " INNER JOIN roles on users.role=roles.id " +
        " WHERE users.email=$1";
    var params = [email];
    dbhelper.query(sql, params,
        function (results) {
            done(null, results[0]);
        },
        function (error) {
            console.log(error);
            return done(null, null);
        });
};

/**
 * Add a new user
 * @param displayName Full name of the user
 * @param role Role of the user; 0=admin, 1=user
 * @param email Email address of the user
 * @param done Function to call when complete
 */
Users.add = function (displayName, role, email, done) {

    var sql = "INSERT INTO users (displayName, role, email) values ( $1 , $2 , $3 ) returning id";
    var params = [displayName, role, email];

    dbhelper.insert(sql, params,
        function (result) {
            done(result.rows[0].id, null);
        },
        function (error) {
            console.log(error);
            done(null, error);
        });
};

/**
 * Delete a set of users using their ID numbers
 * @param ids
 * @param done
 */
Users.delete = function (ids, done) {

    var params = [];
    for (var i = 1; i <= ids.length; i++) {
        params.push('$' + i);
    }

    var sql = "DELETE FROM USERS WHERE id IN (" + params.join(',') + "  )";

    dbhelper.query(sql, ids,
        function (result) {
            done(true);
        },
        function (error) {
            console.log(error);
            done(false, error);
        });
};

/**
 * Update user data
 *
 * @param id Target users ID
 * @param displayName New display name
 * @param role User role
 * @param email User email
 * @param done Callback
 */
Users.update = function (id, displayName, role, email, done) {
    var params = [displayName, role, email, id];


    var sql = "UPDATE users SET displayName=$1, role=$2, email=$3 where id=$4";

    dbhelper.query(sql, params,
        function (result) {
            done(true);
        },
        function (error) {
            console.log(error);
            done(false, error);
        });
};

module.exports = Users;