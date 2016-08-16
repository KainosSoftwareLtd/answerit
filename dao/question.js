var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var Question = function () {
};

/**
 * Add a new question
 * @param Question text to add
 * @param done Function to call when complete
 */
Question.add = function (question, done) {

    var sql = "INSERT INTO question ( text) values ( $1 ) returning id";
    var params = [question];

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
 * Get a question using its ID
 * @param id ID of the question
 * @param done Function to call with the results
 */
Question.getById = function (id, done) {
    var sql = "SELECT * from question where id=$1";

    var params = [id];
    dbhelper.query(sql, params ,
        function (results) {
            if (results.length != 1) {
                done(null);
            } else {
                done(results[0]);
            }
        },
        function (error) {
            console.error(error);
            done(null);
        });
}

/**
 * Get all the questions
 * @param done function to call with the results
 */
Question.getAll = function (done) {
    dbhelper.getAllFromTable("question", done);
}

module.exports = Question;