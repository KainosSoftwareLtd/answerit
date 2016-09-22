'use strict';

var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var Answer = function () {
};

/**
 * Add a new answer
 * @param Answer text to add
 * @param done Function to call when complete
 */
Answer.add = function (answer, userId, done) {

    var sql = "INSERT INTO answer ( text, userId, ti ) values ( $1 , $2 , to_tsvector('english',$1) ) returning id";
    var params = [answer, userId];

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
Answer.getForQuestionId = function (id, done) {
    var sql = "select a.*, u.displayname, u.email from answer a " +
        "join question_answer_link qal on qal.answer_id=a.id " +
        "left outer join users u on u.id=a.userid " +
        "where qal.question_id=$1";

    var params = [id];
    dbhelper.query(sql, params,
        function (results) {
            done(results);
        },
        function (error) {
            console.error(error);
            done(null);
        });
}

/**
 * Perform a full text search using the supplied terms
 * @param terms
 * @param done
 */
Answer.search = function (terms, done) {
    var sql = "SELECT id,text from answer where ti @@ to_tsquery($1)";

    console.log(sql);
    var params = [terms];
    dbhelper.query(sql, params,
        function (results) {
            done(results);
        },
        function (error) {
            console.error(error);
            done(null);
        });
}

Answer.delete = function( answerId, done) {
    var params = [answerId];

    var sql = "DELETE FROM answer WHERE id = $1";

    dbhelper.query(sql, params,
        function (result) {
            done(true);
        },
        function (error) {
            console.error(error);
            done(false, error);
        });
}

module.exports = Answer;